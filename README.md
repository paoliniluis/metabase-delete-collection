# Delete collections in Metabase

You can't delete collections in Metabase, but this script will do its best to make that happen

NOTE: this will only work fine in v49, as newer versions add more entities to the database which are not considered here. If you're running a version other than 49.x please consider making the changes to the script or simply open a feature request. You should NOT run this on different versions as you "might" leave orphan entities in the database

## Reason why you can't do this yet

There are a lot of child dependencies in Metabase that doesn't allow a clean wipe of the collections entity in Metabase, e.g. permissions.

## What do you need to run this script:

- Node.js LTS
- the credentials of the Metabase app DB (user, password, host, port, database)
- either the Collection ID of the collection you want to delete or just delete everything that's archived

## How to run this

Simply run
`DB_USER=<your_app_db_user> DB_PASSWORD=<your_app_db_password> DB_HOST=<the_hostname_of_your_app_db> DB_PORT=<the_app_db_port> DB_DATABASE=<the_database_where_metabase_app_db_is_located> COLLECTION_ID=<the_collection_you_want_to_delete> node index.js` in case you want to delete a specific collection with its children or
`DB_USER=<your_app_db_user> DB_PASSWORD=<your_app_db_password> DB_HOST=<the_hostname_of_your_app_db> DB_PORT=<the_app_db_port> DB_DATABASE=<the_database_where_metabase_app_db_is_located> DELETE_ARCHIVED=true node index.js` in case you want to delete all the archived collections and items

This script will generate a finalSQL.sql file in the directory where you're running the script that you need to run in a separate IDE which will delete the collections and its child collections along all entities that exist on these (e.g. questions, dashboards, etc)
