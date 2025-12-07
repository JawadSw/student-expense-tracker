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

##  Copilot Reflection

I used GitHub Copilot mainly to speed up parts of the UI and help structure the chart component. It suggested the initial layout for the bar chart and helped with some of the styling. I changed a few suggestions, like when it tried to use hard-coded data instead of my real category totals. Copilot also helped give me the idea to move everything into a FlatList header so the screen would scroll again. Overall, it saved me time, but I still reviewed and adjusted the code to make sure it worked correctly with my app.
