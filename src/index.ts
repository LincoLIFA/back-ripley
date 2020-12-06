import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as path from 'path';
import { setEmitFlags } from 'typescript';

//Connects to the Database -> then starts the express
createConnection()
    .then(async (connection) => {
        // Create a new express application instance
        const app = express();
      
        app.use(helmet());
        app.use(bodyParser.json());
      
        const http = app.listen(process.env.PORT || 3000, () => {
            console.log('Server started on port 3000');
        });
      
        
        const AssistantV2 = require('ibm-watson/assistant/v2');
        const { IamAuthenticator } = require('ibm-watson/auth');
        const assistant = new AssistantV2({
            version: '2020-12-05',
            authenticator: new IamAuthenticator({
                apikey: 'ZxaqUpogK4Jzlc9gfGJcmvvinFsowFP6ucEnmiTZW95o',
            }),
            serviceUrl: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/22e3b63c-b66e-456c-b0bf-f9ed17e0fca2',
        });

        /** conexion web socket */
        let io = require('socket.io')(http, {
            cors: {
                origin: "*",
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        let session_id;
        io.on('connection', (socket: any) => {
            socket.on('set-name', (nickname) => {
                socket.nickname = nickname;
                assistant.createSession({
                    assistantId: 'a4f92871-728e-4422-bcb6-2db9f79b06e3'
                }).then(res => {
                    session_id = res.result.session_id;
                    assistant.message({
                        assistantId: 'a4f92871-728e-4422-bcb6-2db9f79b06e3',
                        sessionId: session_id,
                        }).then(res => {
                            let respuesta = res.result.output.generic;
                            respuesta.forEach(element => {
                                socket.emit('listen-message', { message: element.text, user: socket.nickname, createdAt: new Date() });
                            });
                        }).catch(err => { });
                }).catch(err => {
                    console.log(err);
                });
          });
          let mensaje: any;
          socket.on('send-message', (text: any) => {
              mensaje = text;
                assistant.message({
                assistantId: 'a4f92871-728e-4422-bcb6-2db9f79b06e3',
                sessionId: session_id,
                input: {
                  message_type: 'text',
                  text: text
                  }
                }).then(res => {
                    let respuesta = res.result.output.generic;
                    respuesta.forEach(element => {
                        socket.emit('listen-message', { message: element.text, user: socket.nickname, createdAt: new Date() });
                        socket.emit('message', { message: element.text, user: socket.nickname, createdAt: new Date() })   
                    });
                }).catch(err => { });
          });
          socket.on('disconnect', function () {
            const deleteSession = assistant.deleteSession({
                  assistantId: 'a4f92871-728e-4422-bcb6-2db9f79b06e3',
                sessionId: session_id,
            });
          });
      });
        
    /** Ruta para subir archivos */
    app.use('/uploads', express.static(path.resolve('uploads')));

  })
    .catch((error) => console.log(error));