# Student Expense Tracker (React Native + SQLite)

This project is my final assignment for the React Native course.  
I enhanced my existing Student Expense Tracker app by adding a **dynamic bar chart** that visualizes real spending data by category.  
All data is stored locally using **SQLite** and the chart updates automatically when the underlying data changes.

##  Features

- Add, edit, and delete expenses  
- SQLite persistent storage (`expo-sqlite`)  
- Filters: All, This Week, and This Month  
- Category breakdown totals  
- **Bar chart visualization** powered by `react-native-chart-kit`  
- Fully scrollable interface  
- Dark theme UI  

##  Chart Details

- The chart uses real data from the app’s SQLite database  
- Displays spending totals by category  
- Automatically responds to filters (All / Week / Month)  
- Includes clear labels for title, X-axis, and Y-axis  

##  Getting Started

```bash
npm install
npx expo start
