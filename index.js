import postgres from 'postgres'
import fs from 'node:fs';

const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const host = process.env.DB_HOST
const port = process.env.DB_PORT
const database = process.env.DB_DATABASE
const collectionId = process.env.COLLECTION_ID

const collectionPath = `/${collectionId}/`

// Just a very brief check to see if the user provided the necessary environment variables to make the connection
if (!user || !password || !host || !port || !database) {
    console.error('Missing environment variables')
    process.exit(1)
}

const sql = postgres(`postgres://${user}:${password}@${host}:${port}/${database}`, {})

try {
    // This is just a very basic check to see if the user has the necessary permissions to SELECT
    const checkPermissions = await sql`
        SELECT has_table_privilege(${user}, 'collection', 'SELECT') AS can_select
    `
    if (!checkPermissions[0].can_select) {
        throw new Error({
            code: 'InsufficientPermissions', 
            message: 'User does not have the necessary permissions to SELECT from the collection table'
        })
    }

    const collectionsToDelete = await sql`
    WITH ids AS (SELECT id, location
        FROM collection
        WHERE location LIKE ${'%' + collectionPath + '%'}
        UNION ALL
        SELECT id, location
        FROM collection
        WHERE id = ${collectionId})

    SELECT id, location
    FROM ids
    ORDER BY length(location) DESC
    `
    const sqlArray = []

    sqlArray.push ('BEGIN TRANSACTION;')

    collectionsToDelete.forEach(async (collection) => {
        sqlArray.push(`
            DELETE FROM collection_bookmark WHERE collection_id = ${collection.id};
            DELETE FROM timeline WHERE collection_id = ${collection.id};
            DELETE FROM pulse WHERE collection_id = ${collection.id};
            DELETE FROM report_dashboard WHERE collection_id = ${collection.id};
            DELETE FROM report_card WHERE collection_id = ${collection.id};
            DELETE FROM permissions WHERE collection_id = ${collection.id};
            DELETE FROM collection WHERE id = ${collection.id};
        `)
    })

    sqlArray.push ('END TRANSACTION;')

    fs.writeFileSync('finalSQL.sql', sqlArray.join(''))
    console.info('SQL file created')
    
    await sql.end()
} catch (error) {
    await sql.end()
    switch (error.code) {
        case 'ECONNREFUSED':
            console.error('Connection refused')
            break
        case 'ENOTFOUND':
            console.error('Host not found')
            break
        case 'ECONNRESET':
            console.error('Connection reset')
            break
        case 'ETIMEDOUT':
            console.error('Connection timed out')
            break
        case 'InsufficientPermissions':
            console.error(error.message)
            break
        default:
            console.error(error)
    }
}
