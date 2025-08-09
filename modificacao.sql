USE techbook_store;

SELECT * 
FROM produtos
WHERE nome = 'TechBook Pro';

UPDATE produtos
SET PRECO = 5000.00
WHERE nome = 'TechBook Pro';
