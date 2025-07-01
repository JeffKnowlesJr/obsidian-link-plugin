#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'FEATURE_CONFIG.json');

function loadConfig() {
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading config:', error.message);
        process.exit(1);
    }
}

function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log('✅ Configuration saved successfully!');
    } catch (error) {
        console.error('Error saving config:', error.message);
        process.exit(1);
    }
}

function listFeatures() {
    const config = loadConfig();
    console.log('\n🚀 Available Features:\n');
    
    Object.entries(config.features).forEach(([key, feature]) => {
        const status = feature.enabled ? '✅ ENABLED' : '⭕ DISABLED';
        const priority = '⭐'.repeat(5 - feature.priority);
        
        console.log(`${status} [${priority}] ${key}`);
        console.log(`   📝 ${feature.description}`);
        console.log(`   ⏱️  ${feature.estimated_effort}`);
        console.log(`   📂 ${feature.category}\n`);
    });
}

function listEnabled() {
    const config = loadConfig();
    const enabled = Object.entries(config.features)
        .filter(([key, feature]) => feature.enabled)
        .sort((a, b) => a[1].priority - b[1].priority);
    
    if (enabled.length === 0) {
        console.log('❌ No features currently enabled.');
        return;
    }
    
    console.log('\n✅ Enabled Features (by priority):\n');
    enabled.forEach(([key, feature]) => {
        console.log(`Priority ${feature.priority}: ${key}`);
        console.log(`   📝 ${feature.description}`);
        console.log(`   ⏱️  ${feature.estimated_effort}\n`);
    });
    
    const totalEffort = enabled.reduce((acc, [key, feature]) => {
        const days = feature.estimated_effort.match(/(\d+)-?(\d+)?/);
        const min = parseInt(days[1]);
        const max = days[2] ? parseInt(days[2]) : min;
        return acc + max;
    }, 0);
    
    console.log(`📊 Total estimated effort: ~${totalEffort} days`);
}

function enableFeature(featureName) {
    const config = loadConfig();
    
    if (!config.features[featureName]) {
        console.error(`❌ Feature '${featureName}' not found.`);
        console.log('\nAvailable features:');
        Object.keys(config.features).forEach(key => console.log(`  - ${key}`));
        return;
    }
    
    config.features[featureName].enabled = true;
    saveConfig(config);
    console.log(`✅ Enabled feature: ${featureName}`);
}

function disableFeature(featureName) {
    const config = loadConfig();
    
    if (!config.features[featureName]) {
        console.error(`❌ Feature '${featureName}' not found.`);
        return;
    }
    
    config.features[featureName].enabled = false;
    saveConfig(config);
    console.log(`⭕ Disabled feature: ${featureName}`);
}

function applyPreset(presetName) {
    const config = loadConfig();
    const preset = config.configuration.example_selections[presetName];
    
    if (!preset) {
        console.error(`❌ Preset '${presetName}' not found.`);
        console.log('\nAvailable presets:');
        Object.keys(config.configuration.example_selections).forEach(key => {
            const p = config.configuration.example_selections[key];
            console.log(`  - ${key}: ${p.description}`);
        });
        return;
    }
    
    // Disable all features first
    Object.keys(config.features).forEach(key => {
        config.features[key].enabled = false;
    });
    
    // Enable preset features
    preset.enabled_features.forEach(featureName => {
        if (config.features[featureName]) {
            config.features[featureName].enabled = true;
        }
    });
    
    saveConfig(config);
    console.log(`✅ Applied preset: ${presetName}`);
    console.log(`📝 ${preset.description}`);
}

function showHelp() {
    console.log(`
🛠️  Feature Configuration Helper

Usage: node scripts/feature-config-helper.js <command> [arguments]

Commands:
  list                    List all available features
  enabled                 Show currently enabled features
  enable <feature>        Enable a specific feature
  disable <feature>       Disable a specific feature
  preset <preset_name>    Apply a preset configuration
  help                    Show this help message

Examples:
  node scripts/feature-config-helper.js list
  node scripts/feature-config-helper.js enable file_sorting_system
  node scripts/feature-config-helper.js preset minimal_mvp
  node scripts/feature-config-helper.js enabled
`);
}

// Main execution
const command = process.argv[2];
const argument = process.argv[3];

switch (command) {
    case 'list':
        listFeatures();
        break;
    case 'enabled':
        listEnabled();
        break;
    case 'enable':
        if (!argument) {
            console.error('❌ Please specify a feature name');
            process.exit(1);
        }
        enableFeature(argument);
        break;
    case 'disable':
        if (!argument) {
            console.error('❌ Please specify a feature name');
            process.exit(1);
        }
        disableFeature(argument);
        break;
    case 'preset':
        if (!argument) {
            console.error('❌ Please specify a preset name');
            process.exit(1);
        }
        applyPreset(argument);
        break;
    case 'help':
    default:
        showHelp();
        break;
} 