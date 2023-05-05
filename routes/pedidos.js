const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;


//RETORNA TODOS OS PEDIDOS
router.get('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM pedidos;',
            (error, result, fields) => {
                if(error) {return res.status(500).send({error : error})}
                const response = {
                    quantidade: result.length,
                    pedidos: result.map(pedido =>{
                        return{
                            id_pedidos: pedido.id_pedidos,
                            quantidade: pedido.quantidade,
                            produtos_id_produtos: pedido.produtos_id_produtos,                            
                            request: {
                                tipo:"GET",
                                descricao: "Retorna os detalhes de um pedido específico",
                                url: "http://localhost:3000/pedidos/" + pedido.id_pedidos
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )         
    });
});

//INSERE UM PEDIDO
router.post('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query('SELECT * FROM produtos WHERE id_produtos = ?',
        [req.body.produtos_id_produtos],
        (error,result,field) =>{
            if (error) { return res.status(500).send({ error: error }) }
            if (result.length === 0) {
                return res.status(404).send({
                    mensagem: "Produto não encontrado"
                })
            }
            conn.query(
                'INSERT INTO pedidos (quantidade, produtos_id_produtos) VALUES (?,?)',
                [ req.body.quantidade, req.body.produtos_id_produtos],
                (error, result, field) =>{
                    conn.release();
                    if(error) {return res.status(500).send({error : error})}
                    const response = {
                        mensagem: 'Pedido inserido com sucesso!',
                        pedidoCriado:{
                            id_pedidos: result.id_pedidos,
                            quantidade: req.body.quantidade,
                            produtos_id_produtos: req.body.produtos_id_produtos,
                            request: {
                                tipo:"GET",
                                descricao: "Retorna todos os pedidos",
                                url: "http://localhost:3000/pedidos/"
                            }
                        }
                    }
                    res.status(201).send(response);
                }
            )
        });
    });
});



//RETORNA OS DADOS DE UM PEDIDO
router.get('/:id_pedidos', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM pedidos WHERE id_pedidos = ?;',
            [req.params.id_pedidos],
            (error, result, fields) => {
                if(error) {return res.status(500).send({error : error})}
                if (result.length === 0) {
                        return res.status(404).send({
                            mensagem: "Não foi encontrado pedido com este ID"
                        })
                }
                const response = {      
                    pedido:{
                        id_pedidos: result[0].id_pedidos,
                        quantidade: result[0].quantidade,
                        produtos_id_produtos: result[0].produtos_id_produtos,
                        request: {
                            tipo:"GET",
                            descricao: "Retorna todos os pedidos.",
                            url: "http://localhost:3000/produtos/"
                        }
                    }
                }

                return res.status(200).send(response)
            }
        )         
    });
});



//EXCLUI UM PEDIDO
router.delete('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'DELETE FROM pedidos WHERE id_pedidos = ?;', 
            [req.body.id_pedidos],
            (error, results, fields) => {
                conn.release();  
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Pedido removido com sucesso!',
                    request:{

                            tipo: 'POST', 
                            descricao: 'Insere um pedido.', 
                            url: 'http://localhost:3000/pedidos',
                            body:{
                                quantidade: "Number", 
                                produtos_id_produtos: "Number"
                            }
                    }
                    
                }
                return res.status(202).send(response);
            }
        )
    });
});

module.exports = router;