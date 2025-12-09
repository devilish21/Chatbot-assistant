const http = require('http');

const services = [
    { name: 'Jenkins', port: 3897 },
    { name: 'Jira', port: 3898 },
    { name: 'SonarQube', port: 3899 },
    { name: 'Nexus', port: 3900 },
    { name: 'Bitbucket', port: 3901 },
    { name: 'Elasticsearch', port: 3902 },
    { name: 'Grafana', port: 3903 }
];

async function checkEndpoint(name, port, path) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ ok: res.statusCode === 200, status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ ok: false, status: res.statusCode, error: 'Invalid JSON' });
                }
            });
        });
        req.on('error', (e) => resolve({ ok: false, error: e.message }));
        req.setTimeout(2000, () => {
            req.destroy();
            resolve({ ok: false, error: 'Timeout' });
        });
    });
}

async function validate() {
    console.log('Starting Comprehensive MCP Endpoint Validation...\n');
    console.log('| Service       | Port | Health Check | /tools Endpoint | Tools Found |');
    console.log('|---------------|------|--------------|-----------------|-------------|');

    let allPass = true;

    for (const svc of services) {
        // Check Health
        const health = await checkEndpoint(svc.name, svc.port, '/health');
        const healthStatus = health.ok ? '✅ OK' : `❌ ${health.error || health.status}`;

        // Check Tools
        const tools = await checkEndpoint(svc.name, svc.port, '/tools');
        const toolsStatus = tools.ok ? '✅ OK' : `❌ ${tools.error || tools.status}`;

        let toolCount = '-';
        if (tools.ok && tools.data.tools) {
            toolCount = tools.data.tools.length.toString();
        } else if (tools.ok) {
            toolCount = '0 (Warn)';
        }

        console.log(`| ${svc.name.padEnd(13)} | ${svc.port} | ${healthStatus.padEnd(12)} | ${toolsStatus.padEnd(15)} | ${toolCount.padEnd(11)} |`);

        if (!health.ok || !tools.ok) allPass = false;
    }

    console.log('\nValidation Complete.');
    if (allPass) {
        console.log('✅ All services are RUNNING and HEALTHY.');
    } else {
        console.error('❌ Some services failed validation.');
        process.exit(1);
    }
}

validate();
