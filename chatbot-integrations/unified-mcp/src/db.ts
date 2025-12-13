
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Create connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'devopsdb',
    password: process.env.DB_PASS || 'adminpassword',
    port: parseInt(process.env.DB_PORT || '5432'),
});

console.log(`[DB] Connecting to postgres at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

// Helper to query
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Initialize Tables
export const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log("[DB] Initializing database schema...");

        // 1. Logs Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id SERIAL PRIMARY KEY,
                level VARCHAR(10) NOT NULL,
                message TEXT NOT NULL,
                service VARCHAR(50) DEFAULT 'mcp-server',
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            );
        `);

        // 2. Metrics Table (LLM Requests)
        await client.query(`
            CREATE TABLE IF NOT EXISTS llm_metrics (
                id VARCHAR(50) PRIMARY KEY,
                model VARCHAR(50),
                duration_ms INTEGER,
                ttft_ms INTEGER,
                input_tokens INTEGER,
                output_tokens INTEGER,
                success BOOLEAN,
                error_msg TEXT,
                timestamp BIGINT,
                session_id VARCHAR(50)
            );
        `);

        // 3. Tool Usage Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tool_usage (
                id VARCHAR(50) PRIMARY KEY,
                tool_name VARCHAR(100),
                service VARCHAR(50),
                args JSONB,
                success BOOLEAN,
                error_msg TEXT,
                duration_ms INTEGER,
                timestamp BIGINT,
                session_id VARCHAR(50)
            );
        `);

        // 4. User Feedback Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_feedback (
                id SERIAL PRIMARY KEY,
                message_id VARCHAR(50),
                rating INTEGER, -- 1 (like) or -1 (dislike)
                comment TEXT,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. User Sessions Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                session_id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50),
                start_time BIGINT,
                last_active BIGINT,
                platform VARCHAR(50),
                user_agent TEXT
            );
        `);

        // 6. Security Events Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS security_events (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(50), -- 'auth_failure', 'unauthorized_tool'
                severity VARCHAR(20), -- 'info', 'warning', 'critical'
                description TEXT,
                metadata JSONB,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // --- Schema Migration Helpers ---
        // Since CREATE TABLE IF NOT EXISTS doesn't add new columns to existing tables

        // Helper to safe add column
        const addColumn = async (table: string, column: string, type: string) => {
            try {
                await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type};`);
                console.log(`[DB] Ensure column ${table}.${column} exists.`);
            } catch (ignore) {
                // Ignore if exists
            }
        };

        // LLM Metrics Migrations
        await addColumn('llm_metrics', 'ttft_ms', 'INTEGER');
        await addColumn('llm_metrics', 'session_id', 'VARCHAR(50)');

        // Tool Usage Migrations
        await addColumn('tool_usage', 'session_id', 'VARCHAR(50)');
        await addColumn('tool_usage', 'duration_ms', 'INTEGER');

        console.log("Database initialized successfully");
    } catch (err) {
        console.error("[DB] Failed to initialize database:", err);
    } finally {
        client.release();
    }
};

// Logging Helper
export const logEvent = async (level: string, message: string, service: string = 'mcp-server', metadata: any = {}) => {
    try {
        await query(
            'INSERT INTO system_logs (level, message, service, metadata) VALUES ($1, $2, $3, $4)',
            [level, message, service, metadata]
        );
    } catch (e) {
        console.error("Failed to write log to DB", e);
    }
};
