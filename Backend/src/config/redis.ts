import dotenv from 'dotenv'
import { createClient } from 'redis';
dotenv.config()
const redisClient = createClient({
    url: process.env.REDIS_URL||'redis://default:ZADqZUTwa1awl4irP06ZwoKhA64TLkUS@redis-17005.crce217.ap-south-1-1.ec2.cloud.redislabs.com:17005'
});

redisClient.on('error', (err) => {
    
    console.error(' Redis Connection Error'); 
});

(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log(' Redis Cloud Connected Successfully!');
        }
    } catch (err) {
        console.error('Failed to connect to Redis Cloud:', err);
    }
})();

export default redisClient;