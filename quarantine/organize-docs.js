#!/usr/bin/env node

/**
 * Documentation Organization Script
 * 
 * This script organizes all project documentation into a structured /docs directory
 * while maintaining the main README.md in the root directory.
 */

const fs = require('fs');
const path = require('path');

// Define the documentation structure
const DOCS_STRUCTURE = {
  'user-guides': [
    'RIBBON_INTERFACE_GUIDE.md',
    'SETTINGS_UI_GUIDE.md'
  ],
  'development': [
    'DEVELOPMENT_GUIDE.md',
    'TROUBLESHOOTING.md',
    'TEST_RESULTS.md'
  ],
  'architecture': [
    'BASE_FOLDER_IMPLEMENTATION.md',
    'MONTHLY_FOLDER_MANAGEMENT.md'
  ],
  'project-management': [
    'PROGRESS.md',
    'RIBBON_IMPLEMENTATION_SUMMARY.md'
  ]
};

// Files to keep in root directory
const ROOT_FILES = [
  'README.md'
];

/**
 * Create directory if it doesn't exist
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

/**
 * Move file from source to destination
 */
function moveFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      // Ensure destination directory exists
      ensureDirectory(path.dirname(destination));
      
      // Move the file
      fs.renameSync(source, destination);
      console.log(`📄 Moved: ${source} → ${destination}`);
      return true;
    } else {
      console.log(`⚠️  File not found: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error moving ${source}:`, error.message);
    return false;
  }
}

/**
 * Update internal links in markdown files
 */
function updateLinksInFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Update links to moved documentation files
    Object.entries(DOCS_STRUCTURE).forEach(([category, files]) => {
      files.forEach(file => {
        const oldLink = new RegExp(`\\[([^\\]]+)\\]\\(${file}\\)`, 'g');
        const newLink = `[$1](docs/${category}/${file})`;
        
        if (content.match(oldLink)) {
          content = content.replace(oldLink, newLink);
          updated = true;
        }

        // Also update direct file references
        const directRef = new RegExp(`\\(${file}\\)`, 'g');
        const newDirectRef = `(docs/${category}/${file})`;
        
        if (content.match(directRef)) {
          content = content.replace(directRef, newDirectRef);
          updated = true;
        }
      });
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`🔗 Updated links in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating links in ${filePath}:`, error.message);
  }
}

/**
 * Create index files for each documentation category
 */
function createCategoryIndex(category, files) {
  const indexPath = path.join('docs', category, 'README.md');
  
  const categoryTitles = {
    'user-guides': 'User Guides',
    'development': 'Development Documentation',
    'architecture': 'Architecture & Implementation',
    'project-management': 'Project Management'
  };

  const categoryDescriptions = {
    'user-guides': 'Documentation for end users on how to use the plugin features.',
    'development': 'Technical documentation for developers working on the plugin.',
    'architecture': 'Detailed implementation guides and architectural decisions.',
    'project-management': 'Project progress, summaries, and implementation tracking.'
  };

  const indexContent = `# ${categoryTitles[category]}

${categoryDescriptions[category]}

## Documents in this section:

${files.map(file => {
  const name = file.replace('.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `- [${name}](${file})`;
}).join('\n')}

---

[← Back to Documentation Index](../README.md)
`;

  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`📋 Created index: ${indexPath}`);
}

/**
 * Create main documentation index
 */
function createMainDocsIndex() {
  const indexContent = `# Documentation Index

This directory contains all project documentation organized by category.

## 📚 Documentation Categories

### 👥 [User Guides](user-guides/)
Documentation for end users on how to use the plugin features.
- [Ribbon Interface Guide](user-guides/RIBBON_INTERFACE_GUIDE.md)
- [Settings UI Guide](user-guides/SETTINGS_UI_GUIDE.md)

### 🔧 [Development](development/)
Technical documentation for developers working on the plugin.
- [Development Guide](development/DEVELOPMENT_GUIDE.md)
- [Troubleshooting](development/TROUBLESHOOTING.md)
- [Test Results](development/TEST_RESULTS.md)

### 🏗️ [Architecture](architecture/)
Detailed implementation guides and architectural decisions.
- [Base Folder Implementation](architecture/BASE_FOLDER_IMPLEMENTATION.md)
- [Monthly Folder Management](architecture/MONTHLY_FOLDER_MANAGEMENT.md)

### 📊 [Project Management](project-management/)
Project progress, summaries, and implementation tracking.
- [Progress](project-management/PROGRESS.md)
- [Ribbon Implementation Summary](project-management/RIBBON_IMPLEMENTATION_SUMMARY.md)

## 🔍 Quick Navigation

- **Getting Started**: [Main README](../README.md)
- **User Documentation**: [User Guides](user-guides/)
- **Developer Resources**: [Development](development/)
- **Technical Details**: [Architecture](architecture/)

## 📝 Documentation Standards

All documentation in this repository follows consistent formatting and organizational standards. See the [Repository Architecture Guide](REPOSITORY_ARCHITECTURE.md) for details on maintaining documentation consistency.

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

  const indexPath = path.join('docs', 'README.md');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`📋 Created main documentation index: ${indexPath}`);
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting documentation organization...\n');

  // Create docs directory structure
  ensureDirectory('docs');
  
  // Create category directories and move files
  Object.entries(DOCS_STRUCTURE).forEach(([category, files]) => {
    const categoryPath = path.join('docs', category);
    ensureDirectory(categoryPath);
    
    // Move files to category directory
    files.forEach(file => {
      const source = file;
      const destination = path.join(categoryPath, file);
      moveFile(source, destination);
    });

    // Create category index
    createCategoryIndex(category, files);
  });

  // Create main documentation index
  createMainDocsIndex();

  // Update links in remaining root files
  console.log('\n🔗 Updating internal links...');
  ROOT_FILES.forEach(file => {
    updateLinksInFile(file);
  });

  // Update links in moved documentation files
  Object.entries(DOCS_STRUCTURE).forEach(([category, files]) => {
    files.forEach(file => {
      const filePath = path.join('docs', category, file);
      updateLinksInFile(filePath);
    });
  });

  console.log('\n✅ Documentation organization complete!');
  console.log('\n📁 New structure:');
  console.log('docs/');
  Object.entries(DOCS_STRUCTURE).forEach(([category, files]) => {
    console.log(`├── ${category}/`);
    files.forEach((file, index) => {
      const isLast = index === files.length - 1;
      console.log(`│   ${isLast ? '└──' : '├──'} ${file}`);
    });
  });
  console.log('└── README.md (main index)');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { DOCS_STRUCTURE, moveFile, ensureDirectory }; 