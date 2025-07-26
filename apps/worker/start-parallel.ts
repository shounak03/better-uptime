import { spawn } from 'child_process';
import path from 'path';

function startProcess(scriptPath: string, name: string, env: Record<string, string> = {}) {
    const processEnv = { ...process.env, ...env };
    
    const child = spawn('bun', ['run', scriptPath], {
        stdio: 'inherit',
        env: processEnv,
        cwd: path.dirname(scriptPath)
    });

    child.on('error', (error) => {
        console.error(`❌ ${name} failed to start:`, error);
    });

    child.on('exit', (code, signal) => {
        console.log(`🛑 ${name} exited with code ${code}, signal ${signal}`);
        // Restart the process if it exits unexpectedly
        if (code !== 0) {
            console.log(`🔄 Restarting ${name} in 5 seconds...`);
            setTimeout(() => startProcess(scriptPath, name, env), 5000);
        }
    });

    console.log(`🚀 Started ${name} (PID: ${child.pid})`);
    return child;
}

async function main() {
    console.log('🌟 Starting Better Uptime Worker Architecture');
    console.log('=========================================');
    
    // Environment variables
    const REGION_ID = process.env.REGION_ID || 'us-east-1';
    const WORKER_ID = process.env.WORKER_ID || 'worker-1';
    const DB_CONSUMER_ID = process.env.DB_CONSUMER_ID || 'db-consumer-1';

    console.log(`Region: ${REGION_ID}`);
    console.log(`Worker ID: ${WORKER_ID}`);
    console.log(`DB Consumer ID: ${DB_CONSUMER_ID}`);
    console.log('');

    // Start website checker worker
    const workerChild = startProcess(
        path.join(__dirname, 'index.ts'),
        'Website Checker Worker',
        { REGION_ID, WORKER_ID }
    );

    // Start database consumer
    const dbConsumerChild = startProcess(
        path.join(__dirname, 'db-consumer.ts'),
        'Database Consumer',
        { REGION_ID, DB_CONSUMER_ID }
    );

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down all processes...');
        workerChild.kill('SIGTERM');
        dbConsumerChild.kill('SIGTERM');
        setTimeout(() => {
            process.exit(0);
        }, 5000);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down all processes...');
        workerChild.kill('SIGTERM');
        dbConsumerChild.kill('SIGTERM');
        setTimeout(() => {
            process.exit(0);
        }, 5000);
    });

    console.log('✅ Parallel architecture is running!');
    console.log('📊 Architecture:');
    console.log('   1. Website Checker Worker → Redis Status Stream');
    console.log('   2. Database Consumer → Redis Status Stream → Database');
    console.log('   3. Both processes run independently for maximum parallelism');
    console.log('');
    console.log('Press Ctrl+C to stop all processes');
}

main().catch(console.error); 