import cron from 'node-cron';
import sql from './db.js';

/**
 * Clean up old sessions (older than 2 weeks)
 * Runs every day at 2 AM
 */
export const cleanupOldSessions = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[CRON] Running session cleanup task...');
      
      // Delete sessions older than 2 weeks
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      
      const result = await sql`
        DELETE FROM sessions 
        WHERE last_active_at < ${twoWeeksAgo}
      `;
      
      console.log(`[CRON] Deleted ${result.length} old sessions`);
    } catch (error) {
      console.error('[CRON] Error cleaning up sessions:', error);
    }
  });
  
  console.log('[CRON] Session cleanup task scheduled (runs daily at 2 AM)');
};

export default cleanupOldSessions;
