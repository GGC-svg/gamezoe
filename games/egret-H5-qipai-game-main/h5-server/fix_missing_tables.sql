-- Fix missing tables and columns for h5-server API
-- Run this on MySQL: mysql -u root -p ma_lai_h5_game_data < fix_missing_tables.sql

-- ============================================
-- 1. Fix player_safe_info table
-- ============================================
DROP TABLE IF EXISTS player_safe_info;
CREATE TABLE player_safe_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    validate_phone TINYINT(1) DEFAULT 0,
    validate_email TINYINT(1) DEFAULT 0,
    first_pwd_protect_q VARCHAR(255) DEFAULT NULL,
    first_pwd_protect_a VARCHAR(255) DEFAULT NULL,
    second_pwd_protect_q VARCHAR(255) DEFAULT NULL,
    second_pwd_protect_a VARCHAR(255) DEFAULT NULL,
    login_phone_verify TINYINT(1) DEFAULT 0,
    UNIQUE KEY uk_player_id (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. Fix player_vip table
-- ============================================
DROP TABLE IF EXISTS player_vip;
CREATE TABLE player_vip (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    play_item_effect TINYINT(1) DEFAULT 0,
    table_limit_gold BIGINT DEFAULT 0,
    table_limit_gold_abled TINYINT(1) DEFAULT 0,
    table_limit_ip TINYINT(1) DEFAULT 0,
    table_pwd VARCHAR(255) DEFAULT NULL,
    table_pwd_abled TINYINT(1) DEFAULT 0,
    room_setting_abled TINYINT(1) DEFAULT 0,
    UNIQUE KEY uk_player_id (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. Fix player_status_record table
-- ============================================
DROP TABLE IF EXISTS player_status_record;
CREATE TABLE player_status_record (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    register_ip VARCHAR(50) DEFAULT NULL,
    register_time DATETIME DEFAULT NULL,
    login_ip VARCHAR(50) DEFAULT NULL,
    login_time DATETIME DEFAULT NULL,
    login_count INT DEFAULT 0,
    logout_time DATETIME DEFAULT NULL,
    gametime BIGINT DEFAULT 0,
    onlinetime BIGINT DEFAULT 0,
    update_time DATETIME DEFAULT NULL,
    UNIQUE KEY uk_player_id (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. Insert records for existing players
-- ============================================
-- Insert player_safe_info for all existing players
INSERT IGNORE INTO player_safe_info (player_id, validate_phone, validate_email, login_phone_verify)
SELECT id, 0, 0, 0 FROM player_main;

-- Insert player_vip for all existing players
INSERT IGNORE INTO player_vip (player_id, play_item_effect, table_limit_gold, table_limit_gold_abled, table_limit_ip, table_pwd_abled, room_setting_abled)
SELECT id, 0, 0, 0, 0, 0, 0 FROM player_main;

-- Insert player_status_record for all existing players
INSERT IGNORE INTO player_status_record (player_id, register_time, login_count, gametime, onlinetime)
SELECT id, NOW(), 0, 0, 0 FROM player_main;

-- ============================================
-- 5. Verify the fix
-- ============================================
SELECT 'player_safe_info' as table_name, COUNT(*) as record_count FROM player_safe_info
UNION ALL
SELECT 'player_vip', COUNT(*) FROM player_vip
UNION ALL
SELECT 'player_status_record', COUNT(*) FROM player_status_record
UNION ALL
SELECT 'player_main', COUNT(*) FROM player_main;
