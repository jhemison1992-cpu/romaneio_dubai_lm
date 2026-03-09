-- Script para inserir dados do PDF ALU-0181-24_PROD2 na obra DUBAI LM
-- Projeto ID: 90001

-- Inserir ambientes para ÁTRIO
INSERT INTO environments (projectId, name, code, floor, status, progress, notes, createdAt, updatedAt) VALUES
(90001, 'SUÍTES - ÁTRIO', 'SUITE-ATRIO', 'ÁTRIO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'DORMITÓRIOS 2 - ÁTRIO', 'DORM2-ATRIO', 'ÁTRIO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'DORMITÓRIOS 3 - ÁTRIO', 'DORM3-ATRIO', 'ÁTRIO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'BANHO 01 E 02 - ÁTRIO', 'BANHO-ATRIO', 'ÁTRIO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'ÁREA DE SERVIÇO - ÁTRIO', 'SERV-ATRIO', 'ÁTRIO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'TERRAÇO - ÁTRIO', 'TERR-ATRIO', 'ÁTRIO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW());

-- Inserir ambientes para 1º AO 28º PAVIMENTO
INSERT INTO environments (projectId, name, code, floor, status, progress, notes, createdAt, updatedAt) VALUES
(90001, 'SUÍTES - 1º AO 28º PAV', 'SUITE-PAV1-28', '1º AO 28º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'DORMITÓRIOS 2 - 1º AO 28º PAV', 'DORM2-PAV1-28', '1º AO 28º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'DORMITÓRIOS 3 - 1º AO 28º PAV', 'DORM3-PAV1-28', '1º AO 28º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'BANHO 01 E 02 - 1º AO 28º PAV', 'BANHO-PAV1-28', '1º AO 28º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'ÁREA DE SERVIÇO - 1º AO 28º PAV', 'SERV-PAV1-28', '1º AO 28º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'TERRAÇO - 1º AO 28º PAV', 'TERR-PAV1-28', '1º AO 28º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW());

-- Inserir ambientes para 29º PAVIMENTO
INSERT INTO environments (projectId, name, code, floor, status, progress, notes, createdAt, updatedAt) VALUES
(90001, 'SUÍTES - 29º PAV', 'SUITE-PAV29', '29º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'DORMITÓRIOS 3 - 29º PAV', 'DORM3-PAV29', '29º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW()),
(90001, 'BANHO 01 E 02 - 29º PAV', 'BANHO-PAV29', '29º PAVIMENTO', 'pending', 0, 'Ambiente criado do PDF ALU-0181-24_PROD2', NOW(), NOW());

-- Inserir caixilhos para SUÍTES - ÁTRIO (Environment ID 1)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(1, 'AL-001', 'JANELA INTEGRADA DE CORRER 2 FOLHAS COM PEITORIL', 'Janela integrada de correr 2 folhas com peitoril, recolhedor de fita - Linha ALU-25', 1376, 1316, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 169, 3445.481, 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1ºAO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6. / FINAL 29º PAVIMENTO: 3.', 'pending', NOW(), NOW());

-- Inserir caixilhos para DORMITÓRIOS 2 - ÁTRIO (Environment ID 2)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(2, 'AL-002', 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE', 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20', 1376, 1026, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 113, 1543.682, 'FINAIS ÁTRIO: 2 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 4 E 5.', 'pending', NOW(), NOW());

-- Inserir caixilhos para DORMITÓRIOS 3 - ÁTRIO (Environment ID 3)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(3, 'AL-003', 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE', 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20', 1176, 1046, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 168, 2094.616, 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6', 'pending', NOW(), NOW());

-- Inserir caixilhos para BANHO 01 E 02 - ÁTRIO (Environment ID 4)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(4, 'AL-004', 'MAXIM-AR 1 FOLHA(S)', 'Maxim-ar 1 folha - Linha ALU-25 sem baguete', 576, 716, 'Alumínio', 'Vidro comum fantasia mini boreal 4mm incolor', 255, 657.503, 'FINAIS ÁTRIO: 2, 3, 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, E 5. / FINAIS 29º PAVIMENTO: 3.', 'pending', NOW(), NOW());

-- Inserir caixilhos para ÁREA DE SERVIÇO - ÁTRIO (Environment ID 5)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(5, 'AL-006', 'JANELA GUILHOTINA 2 FOLHAS', 'Janela guilhotina 2 folhas (1 folha móvel - 1 folha fixa) - Linha ALU-25', 536, 636, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 141, 484.361, 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º: 1, 2, 3, 4 E 5', 'pending', NOW(), NOW()),
(5, 'AL-007', 'JANELA DE CORRER - 2 FOLHA COM BANDEIRA VENTILADA', 'Janela de correr 2 folhas sem baguete com bandeira ventilada - Linha SP 20', 1076, 1046, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 141, 799.581, 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4 E 5.', 'pending', NOW(), NOW()),
(5, 'AL-020', 'VENTILAÇÃO PERMANENTE DV-113 COM ABA', 'Ventilação permanente DV-113 com aba - Linha 25', 650, 760, 'Alumínio', 'Ventilação', 141, 623.992, 'FNAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4 E 5.', 'pending', NOW(), NOW());

-- Inserir caixilhos para TERRAÇO - ÁTRIO (Environment ID 6)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(6, 'AL-016', 'PORTA DE CORRER - 2 FOLHA SEM BAGUETE', 'Porta de correr 2 folhas sem baguete - Linha SP 20', 1686, 2151, 'Alumínio', 'Vidro temperado float liso 6mm incolor / Vidro comum float liso 4mm incolor lapidado', 168, 2327.897, 'FINAIS ÁTRIO: 2, 3 E 4 / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6.', 'pending', NOW(), NOW());

-- Inserir caixilhos para 1º AO 28º PAVIMENTO (replicar para cada ambiente)
-- SUÍTES - 1º AO 28º PAV (Environment ID 7)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(7, 'AL-001', 'JANELA INTEGRADA DE CORRER 2 FOLHAS COM PEITORIL', 'Janela integrada de correr 2 folhas com peitoril, recolhedor de fita - Linha ALU-25', 1376, 1316, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 169, 3445.481, 'FINAIS 1ºAO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6.', 'pending', NOW(), NOW());

-- DORMITÓRIOS 2 - 1º AO 28º PAV (Environment ID 8)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(8, 'AL-002', 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE', 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20', 1376, 1026, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 113, 1543.682, 'FINAIS 1º AO 28º PAVIMENTO: 1, 2, 4 E 5.', 'pending', NOW(), NOW());

-- DORMITÓRIOS 3 - 1º AO 28º PAV (Environment ID 9)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(9, 'AL-003', 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE', 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20', 1176, 1046, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 168, 2094.616, 'FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6', 'pending', NOW(), NOW());

-- BANHO 01 E 02 - 1º AO 28º PAV (Environment ID 10)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(10, 'AL-004', 'MAXIM-AR 1 FOLHA(S)', 'Maxim-ar 1 folha - Linha ALU-25 sem baguete', 576, 716, 'Alumínio', 'Vidro comum fantasia mini boreal 4mm incolor', 255, 657.503, 'FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, E 5.', 'pending', NOW(), NOW());

-- ÁREA DE SERVIÇO - 1º AO 28º PAV (Environment ID 11)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(11, 'AL-006', 'JANELA GUILHOTINA 2 FOLHAS', 'Janela guilhotina 2 folhas (1 folha móvel - 1 folha fixa) - Linha ALU-25', 536, 636, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 141, 484.361, 'FINAIS 1º AO 28º: 1, 2, 3, 4 E 5', 'pending', NOW(), NOW()),
(11, 'AL-007', 'JANELA DE CORRER - 2 FOLHA COM BANDEIRA VENTILADA', 'Janela de correr 2 folhas sem baguete com bandeira ventilada - Linha SP 20', 1076, 1046, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 141, 799.581, 'FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4 E 5.', 'pending', NOW(), NOW()),
(11, 'AL-020', 'VENTILAÇÃO PERMANENTE DV-113 COM ABA', 'Ventilação permanente DV-113 com aba - Linha 25', 650, 760, 'Alumínio', 'Ventilação', 141, 623.992, 'FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4 E 5.', 'pending', NOW(), NOW());

-- TERRAÇO - 1º AO 28º PAV (Environment ID 12)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(12, 'AL-016', 'PORTA DE CORRER - 2 FOLHA SEM BAGUETE', 'Porta de correr 2 folhas sem baguete - Linha SP 20', 1686, 2151, 'Alumínio', 'Vidro temperado float liso 6mm incolor / Vidro comum float liso 4mm incolor lapidado', 168, 2327.897, 'FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6.', 'pending', NOW(), NOW());

-- Inserir caixilhos para 29º PAVIMENTO
-- SUÍTES - 29º PAV (Environment ID 13)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(13, 'AL-001', 'JANELA INTEGRADA DE CORRER 2 FOLHAS COM PEITORIL', 'Janela integrada de correr 2 folhas com peitoril, recolhedor de fita - Linha ALU-25', 1376, 1316, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 169, 3445.481, 'FINAL 29º PAVIMENTO: 3.', 'pending', NOW(), NOW());

-- DORMITÓRIOS 3 - 29º PAV (Environment ID 14)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(14, 'AL-003', 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE', 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20', 1176, 1046, 'Alumínio', 'Vidro comum float liso 4mm incolor lapidado', 168, 2094.616, 'FINAIS 29º PAVIMENTO: 3.', 'pending', NOW(), NOW());

-- BANHO 01 E 02 - 29º PAV (Environment ID 15)
INSERT INTO windows (environmentId, code, type, description, width, height, material, glassType, quantity, weight, observations, status, createdAt, updatedAt) VALUES
(15, 'AL-004', 'MAXIM-AR 1 FOLHA(S)', 'Maxim-ar 1 folha - Linha ALU-25 sem baguete', 576, 716, 'Alumínio', 'Vidro comum fantasia mini boreal 4mm incolor', 255, 657.503, 'FINAIS 29º PAVIMENTO: 3.', 'pending', NOW(), NOW());
