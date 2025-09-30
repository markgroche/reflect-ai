/**
 * Database Service
 * Handles all SQLite database operations with encryption support
 */

import SQLite, { SQLiteDatabase, Transaction, ResultSet } from 'react-native-sqlite-storage';
import { JournalEntry, Conversation, QueryResult } from '../types';

// Enable debug mode in development
if (__DEV__) {
    SQLite.DEBUG(true);
}

SQLite.enablePromise(true);

class DatabaseServiceClass {
    private db: SQLiteDatabase | null = null;
    private readonly DB_NAME = 'reflect.db';
    private readonly DB_VERSION = 1;

    /**
     * Initialize the database and create tables
     */
    async initialize(): Promise<void> {
        try {
            this.db = await SQLite.openDatabase({
                name: this.DB_NAME,
                location: 'default',
                // Note: For production, use SQLCipher for encryption
                // key: 'your-encryption-key-here'
            });

            await this.createTables();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    /**
     * Create database tables
     */
    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const queries = [
            // Journal entries table
            `CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        client_identifier TEXT NOT NULL,
        session_date TEXT NOT NULL,
        session_notes TEXT NOT NULL,
        emotional_state TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        ai_conversation_id TEXT,
        FOREIGN KEY (ai_conversation_id) REFERENCES ai_conversations(id)
      )`,

            // AI conversations table
            `CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        entry_id TEXT NOT NULL,
        messages TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        summary TEXT,
        insights TEXT,
        FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
      )`,

            // App settings table
            `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

            // Create indexes for better performance
            `CREATE INDEX IF NOT EXISTS idx_entries_client ON journal_entries(client_identifier)`,
            `CREATE INDEX IF NOT EXISTS idx_entries_date ON journal_entries(session_date)`,
            `CREATE INDEX IF NOT EXISTS idx_entries_created ON journal_entries(created_at)`,
            `CREATE INDEX IF NOT EXISTS idx_conversations_entry ON ai_conversations(entry_id)`,
        ];

        await this.db.transaction(async (tx: Transaction) => {
            for (const query of queries) {
                await tx.executeSql(query);
            }
        });
    }

    /**
     * Execute a query and return results
     */
    private async executeQuery<T>(
        query: string,
        params: any[] = []
    ): Promise<QueryResult<T>> {
        if (!this.db) throw new Error('Database not initialized');

        const [result] = await this.db.executeSql(query, params);

        const rows: T[] = [];
        for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
        }

        return {
            rows,
            rowsAffected: result.rowsAffected,
        };
    }

    // Journal Entry Methods

    async createEntry(entry: JournalEntry): Promise<void> {
        const query = `
      INSERT INTO journal_entries (
        id, client_identifier, session_date, session_notes, 
        emotional_state, tags, created_at, updated_at, ai_conversation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            entry.id,
            entry.clientIdentifier,
            entry.sessionDate.toISOString(),
            entry.sessionNotes,
            JSON.stringify(entry.emotionalState),
            JSON.stringify(entry.tags),
            entry.createdAt.toISOString(),
            entry.updatedAt.toISOString(),
            entry.aiConversationId || null,
        ];

        await this.executeQuery(query, params);
    }

    async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
        const fields: string[] = [];
        const params: any[] = [];

        // Build dynamic update query
        if (updates.clientIdentifier !== undefined) {
            fields.push('client_identifier = ?');
            params.push(updates.clientIdentifier);
        }
        if (updates.sessionDate !== undefined) {
            fields.push('session_date = ?');
            params.push(updates.sessionDate.toISOString());
        }
        if (updates.sessionNotes !== undefined) {
            fields.push('session_notes = ?');
            params.push(updates.sessionNotes);
        }
        if (updates.emotionalState !== undefined) {
            fields.push('emotional_state = ?');
            params.push(JSON.stringify(updates.emotionalState));
        }
        if (updates.tags !== undefined) {
            fields.push('tags = ?');
            params.push(JSON.stringify(updates.tags));
        }
        if (updates.aiConversationId !== undefined) {
            fields.push('ai_conversation_id = ?');
            params.push(updates.aiConversationId);
        }

        fields.push('updated_at = ?');
        params.push(new Date().toISOString());

        params.push(id);

        const query = `UPDATE journal_entries SET ${fields.join(', ')} WHERE id = ?`;
        await this.executeQuery(query, params);
    }

    async deleteEntry(id: string): Promise<void> {
        const query = 'DELETE FROM journal_entries WHERE id = ?';
        await this.executeQuery(query, [id]);
    }

    async getEntry(id: string): Promise<JournalEntry | null> {
        const query = 'SELECT * FROM journal_entries WHERE id = ?';
        const result = await this.executeQuery<any>(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.parseEntry(result.rows[0]);
    }

    async getAllEntries(): Promise<JournalEntry[]> {
        const query = 'SELECT * FROM journal_entries ORDER BY session_date DESC';
        const result = await this.executeQuery<any>(query);

        return result.rows.map(row => this.parseEntry(row));
    }

    async searchEntries(searchQuery: string): Promise<JournalEntry[]> {
        // Note: For encrypted fields, search capabilities are limited
        // Consider implementing a separate searchable index
        const query = `
      SELECT * FROM journal_entries 
      WHERE tags LIKE ? 
      ORDER BY session_date DESC
    `;

        const result = await this.executeQuery<any>(query, [`%${searchQuery}%`]);
        return result.rows.map(row => this.parseEntry(row));
    }

    async getEntriesByClient(clientId: string): Promise<JournalEntry[]> {
        const query = `
      SELECT * FROM journal_entries 
      WHERE client_identifier = ? 
      ORDER BY session_date DESC
    `;

        const result = await this.executeQuery<any>(query, [clientId]);
        return result.rows.map(row => this.parseEntry(row));
    }

    async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
        const query = `
      SELECT * FROM journal_entries 
      WHERE session_date >= ? AND session_date <= ? 
      ORDER BY session_date DESC
    `;

        const result = await this.executeQuery<any>(query, [
            startDate.toISOString(),
            endDate.toISOString(),
        ]);

        return result.rows.map(row => this.parseEntry(row));
    }

    // Conversation Methods

    async saveConversation(conversation: Conversation): Promise<void> {
        const existingConversation = await this.getConversation(conversation.entryId);

        if (existingConversation) {
            // Update existing conversation
            const query = `
        UPDATE ai_conversations 
        SET messages = ?, updated_at = ?, summary = ?, insights = ?
        WHERE id = ?
      `;

            await this.executeQuery(query, [
                JSON.stringify(conversation.messages),
                conversation.updatedAt.toISOString(),
                conversation.summary || null,
                JSON.stringify(conversation.insights || []),
                conversation.id,
            ]);
        } else {
            // Create new conversation
            const query = `
        INSERT INTO ai_conversations (
          id, entry_id, messages, created_at, updated_at, summary, insights
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

            await this.executeQuery(query, [
                conversation.id,
                conversation.entryId,
                JSON.stringify(conversation.messages),
                conversation.createdAt.toISOString(),
                conversation.updatedAt.toISOString(),
                conversation.summary || null,
                JSON.stringify(conversation.insights || []),
            ]);
        }
    }

    async getConversation(entryId: string): Promise<Conversation | null> {
        const query = 'SELECT * FROM ai_conversations WHERE entry_id = ?';
        const result = await this.executeQuery<any>(query, [entryId]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id,
            entryId: row.entry_id,
            messages: JSON.parse(row.messages),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            summary: row.summary,
            insights: row.insights ? JSON.parse(row.insights) : undefined,
        };
    }

    async deleteConversation(entryId: string): Promise<void> {
        const query = 'DELETE FROM ai_conversations WHERE entry_id = ?';
        await this.executeQuery(query, [entryId]);
    }

    // Settings Methods

    async getSetting(key: string): Promise<string | null> {
        const query = 'SELECT value FROM app_settings WHERE key = ?';
        const result = await this.executeQuery<any>(query, [key]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].value;
    }

    async setSetting(key: string, value: string): Promise<void> {
        const query = `
      INSERT OR REPLACE INTO app_settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `;

        await this.executeQuery(query, [key, value, new Date().toISOString()]);
    }

    // Helper Methods

    private parseEntry(row: any): JournalEntry {
        return {
            id: row.id,
            clientIdentifier: row.client_identifier,
            sessionDate: new Date(row.session_date),
            sessionNotes: row.session_notes,
            emotionalState: JSON.parse(row.emotional_state),
            tags: JSON.parse(row.tags || '[]'),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            aiConversationId: row.ai_conversation_id,
        };
    }

    /**
     * Close the database connection
     */
    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }

    /**
     * Clear all data (use with caution!)
     */
    async clearAllData(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.transaction(async (tx: Transaction) => {
            await tx.executeSql('DELETE FROM ai_conversations');
            await tx.executeSql('DELETE FROM journal_entries');
            await tx.executeSql('DELETE FROM app_settings');
        });
    }

    /**
     * Export database for backup
     */
    async exportDatabase(): Promise<string> {
        // Implementation would depend on the specific backup strategy
        // This is a placeholder for the export functionality
        const entries = await this.getAllEntries();
        const conversations: Conversation[] = [];

        for (const entry of entries) {
            if (entry.aiConversationId) {
                const conversation = await this.getConversation(entry.id);
                if (conversation) {
                    conversations.push(conversation);
                }
            }
        }

        return JSON.stringify({
            version: this.DB_VERSION,
            exportDate: new Date().toISOString(),
            entries,
            conversations,
        });
    }
}

export const DatabaseService = new DatabaseServiceClass();
