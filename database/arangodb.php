<?php

  // use the following line when using git
  require __DIR__ . '/arangodb/autoload.php';

  // set up some aliases for less typing later
    use ArangoDBClient\Collection as ArangoCollection;
    use ArangoDBClient\CollectionHandler as ArangoCollectionHandler;
    use ArangoDBClient\Connection as ArangoConnection;
    use ArangoDBClient\ConnectionOptions as ArangoConnectionOptions;
    use ArangoDBClient\DocumentHandler as ArangoDocumentHandler;
    use ArangoDBClient\Document as ArangoDocument;
    use ArangoDBClient\Exception as ArangoException;
    use ArangoDBClient\Export as ArangoExport;
    use ArangoDBClient\ConnectException as ArangoConnectException;
    use ArangoDBClient\ClientException as ArangoClientException;
    use ArangoDBClient\ServerException as ArangoServerException;
    use ArangoDBClient\Statement as ArangoStatement;
    use ArangoDBClient\UpdatePolicy as ArangoUpdatePolicy;

try { 

    // set up some basic connection options
    $connectionOptions = [
        // database name
        ArangoConnectionOptions::OPTION_DATABASE => '_system',
        // server endpoint to connect to
        ArangoConnectionOptions::OPTION_ENDPOINT => 'tcp://127.0.0.1:8529',
        // authorization type to use (currently supported: 'Basic')
        ArangoConnectionOptions::OPTION_AUTH_TYPE => 'Basic',
        // user for basic authorization
        ArangoConnectionOptions::OPTION_AUTH_USER => 'root',
        // password for basic authorization
        ArangoConnectionOptions::OPTION_AUTH_PASSWD => '',
        // connection persistence on server. can use either 'Close' (one-time connections) or 'Keep-Alive' (re-used connections)
        ArangoConnectionOptions::OPTION_CONNECTION => 'Keep-Alive',
        // connect timeout in seconds
        ArangoConnectionOptions::OPTION_TIMEOUT => 3,
        // whether or not to reconnect when a keep-alive connection has timed out on server
        ArangoConnectionOptions::OPTION_RECONNECT => true,
        // optionally create new collections when inserting documents
        ArangoConnectionOptions::OPTION_CREATE => true,
        // optionally create new collections when inserting documents
        ArangoConnectionOptions::OPTION_UPDATE_POLICY => ArangoUpdatePolicy::LAST,
    ];


    // turn on exception logging (logs to whatever PHP is configured)
    ArangoException::enableLogging();

    $dbArango = new ArangoConnection($connectionOptions);
    
    

} catch (Exception $ex) {
    echo $ex;
} catch (ArangoConnectException $e) {
    print 'Connection error: ' . $e->getMessage() . PHP_EOL;
} catch (ArangoClientException $e) {
    print 'Client error: ' . $e->getMessage() . PHP_EOL;
} catch (ArangoServerException $e) {
    print 'Server error: ' . $e->getServerCode() . ':' . $e->getServerMessage() . ' ' . $e->getMessage() . PHP_EOL;
}