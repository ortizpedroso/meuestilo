-- ============================================================
-- Ag Salão - Schema do banco de dados (MySQL / MariaDB)
-- Importar via phpMyAdmin (Hostinger) no banco criado no hPanel.
-- Charset utf8mb4 para acentuação e emojis.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- Serviços ----------
CREATE TABLE IF NOT EXISTS `services` (
  `id`               VARCHAR(64)  NOT NULL,
  `name`             VARCHAR(180) NOT NULL,
  `description`      TEXT         NULL,
  `duration_minutes` INT          NOT NULL DEFAULT 30,
  `price`            DECIMAL(10,2) NOT NULL DEFAULT 0,
  `category`         VARCHAR(80)  NOT NULL DEFAULT 'Cabelo',
  `image_url`        TEXT         NULL,
  `popular`          TINYINT(1)   NOT NULL DEFAULT 0,
  `sort_order`       INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Profissionais ----------
CREATE TABLE IF NOT EXISTS `professionals` (
  `id`           VARCHAR(64)  NOT NULL,
  `name`         VARCHAR(180) NOT NULL,
  `role`         VARCHAR(180) NULL,
  `avatar`       TEXT         NULL,
  `bio`          TEXT         NULL,
  `rating`       DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `specialties`  TEXT         NULL,  -- JSON array de service ids
  `working_days` TEXT         NULL,  -- JSON array de 0-6
  `start_time`   VARCHAR(5)   NOT NULL DEFAULT '08:00',
  `end_time`     VARCHAR(5)   NOT NULL DEFAULT '19:00',
  `sort_order`   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Agendamentos ----------
CREATE TABLE IF NOT EXISTS `appointments` (
  `id`                VARCHAR(64)  NOT NULL,
  `code`              VARCHAR(32)  NOT NULL,
  `service_id`        VARCHAR(64)  NULL,
  `service_name`      VARCHAR(180) NULL,
  `service_price`     DECIMAL(10,2) NOT NULL DEFAULT 0,
  `service_duration`  INT          NOT NULL DEFAULT 30,
  `professional_id`   VARCHAR(64)  NULL,
  `professional_name` VARCHAR(180) NULL,
  `date`              VARCHAR(10)  NOT NULL,  -- YYYY-MM-DD
  `time`              VARCHAR(5)   NOT NULL,  -- HH:mm
  `client_name`       VARCHAR(180) NOT NULL,
  `client_phone`      VARCHAR(40)  NOT NULL,
  `client_email`      VARCHAR(180) NULL,
  `notes`             TEXT         NULL,
  `status`            VARCHAR(20)  NOT NULL DEFAULT 'confirmed',
  `created_at`        VARCHAR(40)  NULL,
  `reminded_at`       VARCHAR(40)  NULL,
  PRIMARY KEY (`id`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Avaliações ----------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`                VARCHAR(64)  NOT NULL,
  `client_name`       VARCHAR(180) NOT NULL,
  `rating`            INT          NOT NULL DEFAULT 5,
  `comment`           TEXT         NULL,
  `date`              VARCHAR(10)  NOT NULL,
  `service_name`      VARCHAR(180) NULL,
  `professional_name` VARCHAR(180) NULL,
  `verified_booking`  TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Configurações (white-label) - linha única id=1 ----------
CREATE TABLE IF NOT EXISTS `settings` (
  `id`   INT NOT NULL DEFAULT 1,
  `data` LONGTEXT NOT NULL,  -- JSON com SalonSettings completo
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Assinaturas (SaaS) ----------
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`          VARCHAR(64)  NOT NULL,
  `plan`        VARCHAR(80)  NOT NULL,
  `holder_name` VARCHAR(180) NOT NULL,
  `email`       VARCHAR(180) NOT NULL,
  `phone`       VARCHAR(40)  NULL,
  `salon_name`  VARCHAR(180) NULL,
  `price`       DECIMAL(10,2) NOT NULL DEFAULT 0,
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'pending',
  `provider`    VARCHAR(40)  NULL,        -- 'mercadopago' futuramente
  `provider_ref` VARCHAR(120) NULL,       -- id da preferência/pagamento MP
  `created_at`  VARCHAR(40)  NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED (dados iniciais de demonstração)
-- ============================================================

INSERT INTO `services` (`id`,`name`,`description`,`duration_minutes`,`price`,`category`,`image_url`,`popular`,`sort_order`) VALUES
('srv-1','Corte Masculino','Corte moderno ou clássico com tesoura e máquina, finalização com pomada e lavagem relaxante.',30,45.00,'Cabelo','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',1,1),
('srv-2','Corte Feminino','Design de corte personalizado com visagismo, lavagem especial, hidratação rápida e secagem.',50,90.00,'Cabelo','https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',1,2),
('srv-3','Escova Modeladora','Lavagem com xampu de nutrição profunda e escovação com acabamento liso ou ondulado.',40,60.00,'Cabelo','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',0,3),
('srv-4','Progressiva Orgânica','Alinhamento capilar sem formol, reduz o volume, elimina o frizz e proporciona brilho intenso.',120,180.00,'Tratamentos','https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400',1,4),
('srv-5','Barba com Toalha Quente','Modelagem completa de barba com alinhamento na navalha, produtos hidratantes e toalha aquecida.',25,35.00,'Barba','https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400',0,5),
('srv-6','Manicure Completa','Cutilagem delicada, lixamento, formato desejado, massagem relaxante nas mãos e esmaltação.',40,35.00,'Estética & Unhas','https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',0,6),
('srv-7','Pedicure Completa','Higienização dos pés, esfoliação renovadora, cutilagem, lixamento e esmaltação duradoura.',45,40.00,'Estética & Unhas','https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=400',0,7);

INSERT INTO `professionals` (`id`,`name`,`role`,`avatar`,`bio`,`rating`,`specialties`,`working_days`,`start_time`,`end_time`,`sort_order`) VALUES
('prof-1','Gabriel Alves','Especialista em Cortes & Barba','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300','Mais de 8 anos de experiência em cortes masculinos modernos, barboterapia e visagismo.',4.90,'["srv-1","srv-5"]','[1,2,3,4,5,6]','08:00','19:00',1),
('prof-2','Camila Rocha','Hairstylist & Especialista em Tratamentos','https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300','Especialista em mechas, cortes femininos modernos e alinhamentos capilares orgânicos.',5.00,'["srv-2","srv-3","srv-4"]','[1,2,3,4,5,6]','08:30','18:30',2),
('prof-3','Lucas Ferreira','Nail Designer & Estética','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300','Especialista em cuidados corporais, manicure, pedicure e esmaltação em gel com acabamento impecável.',4.80,'["srv-6","srv-7"]','[1,2,3,4,5,6]','09:00','19:00',3);

INSERT INTO `reviews` (`id`,`client_name`,`rating`,`comment`,`date`,`service_name`,`professional_name`,`verified_booking`) VALUES
('rev-1','Mariana Souza',5,'A Camila é incrível! Minha progressiva ficou sensacional, super brilhante e soltinha. Atendimento nota 1000!','2026-07-28','Progressiva Orgânica','Camila Rocha',1),
('rev-2','Thiago Martins',5,'O Gabriel manja demais do degradê e a barboterapia com toalha quente é relaxante demais. Recomendo muito!','2026-07-25','Barba com Toalha Quente','Gabriel Alves',1),
('rev-3','Beatriz Lima',5,'Ambiente super aconchegante, café maravilhoso e o agendamento pelo site facilitou demais minha rotina.','2026-07-20','Manicure Completa','Lucas Ferreira',1),
('rev-4','Rodrigo Alves',4,'Pontualidade no atendimento e agilidade no agendamento. Voltarei mais vezes!','2026-07-15','Corte Masculino','Gabriel Alves',1);

INSERT INTO `settings` (`id`,`data`) VALUES (1, '{"name":"Meu Stilo","tagline":"Salão de Beleza & Barbearia Premium","logoUrl":"https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=200","bannerUrl":"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200","phone":"11988887777","address":"Av. Paulista, 1500 - Bela Vista","city":"São Paulo - SP","instagram":"@meustilobeauty","pixKey":"contato@meustilosalao.com.br","themeColor":"#d97706","workingHours":{"slotIntervalMinutes":30,"workDays":[{"dayOfWeek":0,"dayName":"Domingo","isOpen":false,"openTime":"09:00","closeTime":"14:00"},{"dayOfWeek":1,"dayName":"Segunda-feira","isOpen":true,"openTime":"08:00","closeTime":"19:00","lunchStart":"12:00","lunchEnd":"13:00"},{"dayOfWeek":2,"dayName":"Terça-feira","isOpen":true,"openTime":"08:00","closeTime":"19:00","lunchStart":"12:00","lunchEnd":"13:00"},{"dayOfWeek":3,"dayName":"Quarta-feira","isOpen":true,"openTime":"08:00","closeTime":"19:00","lunchStart":"12:00","lunchEnd":"13:00"},{"dayOfWeek":4,"dayName":"Quinta-feira","isOpen":true,"openTime":"08:00","closeTime":"19:00","lunchStart":"12:00","lunchEnd":"13:00"},{"dayOfWeek":5,"dayName":"Sexta-feira","isOpen":true,"openTime":"08:00","closeTime":"20:00","lunchStart":"12:00","lunchEnd":"13:00"},{"dayOfWeek":6,"dayName":"Sábado","isOpen":true,"openTime":"08:00","closeTime":"20:00","lunchStart":"12:00","lunchEnd":"13:00"}]},"subscriptionPlan":{"name":"Plano Pro Enterprise","status":"active","priceMonthly":89.90,"nextBillingDate":"2026-08-30"}}')
ON DUPLICATE KEY UPDATE `data` = VALUES(`data`);
