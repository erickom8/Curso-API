const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaProdutos = require('./routes/produtos');
const rotaPedidos = require('./routes/pedidos');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));//Apenas dados simples
app.use(bodyParser.json());//json de entrada no body

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');// Caso fosse em mum servidor específico, colar a url... (o '*' significa: TODOS)
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requerested-With,Content-Type, Accept, Authorization'
        );

        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Headers', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).send({});
        }
        next();
    });

app.use('/produtos', rotaProdutos);
app.use('/pedidos', rotaPedidos);

//Quando não encontra rota, retorna aqui
app.use((req, res, next) => {
    const erro = new Error('Não Encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    return res.send({
        erro:{
            mensagem: error.message
        }
    });
});

module.exports = app;