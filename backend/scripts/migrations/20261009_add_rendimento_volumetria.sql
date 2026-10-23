-- GP Tintas: adiciona o rendimento de cada embalagem para a calculadora.
-- Execute uma única vez no banco usado pelo projeto.
-- rendimento = cobertura em m² de UMA embalagem por UMA demão.
ALTER TABLE produto_volumetria
ADD COLUMN rendimento DECIMAL(10,2) NULL AFTER estoque;
