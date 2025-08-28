const Category = require('../models/category');
const mongoose = require('mongoose');
require('dotenv').config();

// Default categories to seed
const defaultCategories = [
    {
        name: "Web Development",
        description: "Learn HTML, CSS, JavaScript, React, Node.js and modern web technologies"
    },
    {
        name: "Data Science",
        description: "Master Python, machine learning, statistics, and data analysis"
    },
    {
        name: "Mobile Development",
        description: "Build iOS and Android apps with React Native, Flutter, and native development"
    },
    {
        name: "Programming Languages",
        description: "Learn Python, Java, C++, JavaScript, and other programming languages"
    },
    {
        name: "Design & UI/UX",
        description: "Master graphic design, user interface design, and user experience principles"
    },
    {
        name: "DevOps & Cloud",
        description: "Learn Docker, Kubernetes, AWS, Azure, and deployment strategies"
    },
    {
        name: "Database & SQL",
        description: "Master database design, SQL, MongoDB, and data management"
    },
    {
        name: "Cybersecurity",
        description: "Learn ethical hacking, network security, and security best practices"
    }
];

// Function to seed categories
async function seedCategories() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        // Check if categories already exist
        const existingCategories = await Category.find({});
        if (existingCategories.length > 0) {
            console.log('Categories already exist, skipping seed');
            return;
        }

        // Create categories
        const createdCategories = await Category.insertMany(defaultCategories);
        console.log(`Successfully created ${createdCategories.length} categories:`);
        
        createdCategories.forEach(cat => {
            console.log(`- ${cat.name}: ${cat.description}`);
        });

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seed function
seedCategories(); 