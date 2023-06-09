const express = require('express');
const { response } = require('../app');
const router = express.Router();
const mysql = require('../mysql').pool;

//RETORNA TODOS OS PRODUTOS
router.get('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM produtos;',
            (error, result, fields) => {
                if(error) {return res.status(500).send({error : error})}
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod =>{
                        return{
                            id_produtos: prod.id_produtos,
                            nome: prod.nome,
                            preco: prod.preco,
                            request: {
                                tipo:"GET",
                                descricao: "Retorna os detalhes de um produto específico",
                                url: "http://localhost:3000/produtos/" + prod.id_produtos
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )         
    });
});

//INSERE UM PRODUTO
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query(
            'INSERT INTO produtos (nome, preco) VALUES (?,?)',
            [req.body.nome, req.body.preco],
            (error, result, field) =>{
                conn.release();
                if(error) {return res.status(500).send({error : error})}
                const response = {
                    mensagem: 'Produto inserido com sucesso!',
                    produtoCriado:{
                        id_produtos: result.id_produtos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo:"GET",
                            descricao: "Retorna todos os produtos",
                            url: "http://localhost:3000/produtos/"
                        }
                    }
                }

                res.status(201).send(response);
            }
        )
    });
});

//RETORNA OS DADOS DE UM PRODUTO
router.get('/:id_produtos', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM produtos WHERE id_produtos = ?;',
            [req.params.id_produtos],
            (error, result, fields) => {
                if(error) {return res.status(500).send({error : error})}

                if (result.length === 0) {
                        return res.status(404).send({
                            mensagem: "Não foi encontrado produto com este ID"
                        })
                }
                const response = {      
                    produto:{
                        id_produtos: result[0].id_produtos,
                        nome: result[0].nome,
                        preco: result[0].preco,
                        request: {
                            tipo:"GET",
                            descricao: "Retorna todos os produtos",
                            url: "http://localhost:3000/produtos/"
                        }
                    }
                }

                return res.status(200).send({response: result})
            }
        )         
    });
});

//ALTERA UM PRODUTO
router.patch('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error : error})}
        conn.query(
            `UPDATE produtos 
                SET nome        = ?,
                    preco       = ?
              WHERE id_produtos = ?`,
            [
                req.body.nome, 
                req.body.preco, 
                req.body.id_produtos
            ],
            (error, result, field) =>{
                conn.release();
                if(error) {return res.status(500).send({error : error})}
                const response = {
                    mensagem: 'Produto atualizado com sucesso!',
                    produtoAtualizado:{
                        id_produtos: req.body.id_produtos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo:"GET",
                            descricao: "Retorna os detalhes de um produto específico",
                            url: "http://localhost:3000/produtos/" + req.body.id_produtos
                        }
                    }
                }

                return res.status(202).send(response);
                
            }
        )
    });
});


//EXCLUI UM PRODUTO
router.delete('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'DELETE FROM produtos WHERE id_produtos = ?;', 
            [req.body.id_produtos],
            (error, results, fields) => {
                conn.release();  
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Produto removido com sucesso!',
                    request:{

                            tipo: 'POST', 
                            descricao: 'Insere um produto.', 
                            url: 'http://localhost:3000/produtos',
                            body:{
                                nome: "String",
                                preco: "Number"
                            }
                    }
                    
                }
                return res.status(202).send(response);
            }
        )
    });
});


module.exports = router;