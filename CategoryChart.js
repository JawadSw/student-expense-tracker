// CategoryChart.js
import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function CategoryChart({ categoryTotals, filterLabel }) {
  const labels = Object.keys(categoryTotals);
  const dataValues = labels.map((cat) => Number(categoryTotals[cat] || 0));

  // If there is no data for this filter, show a friendly message instead of an empty chart
  if (labels.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.title}>
          Spending by Category ({filterLabel})
        </Text>
        <Text style={styles.emptyText}>No data to display for this filter.</Text>
      </View>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#020617',
    backgroundGradientTo: '#020617',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`, // bar color
    labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>
        Spending by Category ({filterLabel})
      </Text>

      <BarChart
        data={data}
        width={screenWidth - 32}   // screen width minus padding
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero
        showValuesOnTopOfBars
      />

      <Text style={styles.axisLabel}>X-axis: Categories</Text>
      <Text style={styles.axisLabel}>Y-axis: Amount in dollars</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  title: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  axisLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});