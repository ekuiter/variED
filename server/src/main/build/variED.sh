#!/bin/bash
java $JAVA_OPTS -cp tomcat-embed-websocket-9.0.8.jar:webapp-runner-9.0.8.1.jar webapp.runner.launch.Main server.war --enable-compression "$@"