import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, IconButton, Tooltip } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';

interface ConversionCategory {
  name: string;
  units: { name: string; factor: number }[];
}

const UnitConverterPage: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('length');

  const conversionCategories: Record<string, ConversionCategory> = {
    length: {
      name: 'Length',
      units: [
        { name: 'Meter', factor: 1 },
        { name: 'Kilometer', factor: 1000 },
        { name: 'Centimeter', factor: 0.01 },
        { name: 'Millimeter', factor: 0.001 },
        { name: 'Mile', factor: 1609.34 },
        { name: 'Yard', factor: 0.9144 },
        { name: 'Foot', factor: 0.3048 },
        { name: 'Inch', factor: 0.0254 }
      ]
    },
    weight: {
      name: 'Weight',
      units: [
        { name: 'Kilogram', factor: 1 },
        { name: 'Gram', factor: 0.001 },
        { name: 'Milligram', factor: 0.000001 },
        { name: 'Pound', factor: 0.453592 },
        { name: 'Ounce', factor: 0.0283495 },
        { name: 'Ton', factor: 1000 }
      ]
    },
    temperature: {
      name: 'Temperature',
      units: [
        { name: 'Celsius', factor: 1 },
        { name: 'Fahrenheit', factor: 1 },
        { name: 'Kelvin', factor: 1 }
      ]
    },
    area: {
      name: 'Area',
      units: [
        { name: 'Square Meter', factor: 1 },
        { name: 'Square Kilometer', factor: 1000000 },
        { name: 'Square Centimeter', factor: 0.0001 },
        { name: 'Square Millimeter', factor: 0.000001 },
        { name: 'Square Mile', factor: 2589988.11 },
        { name: 'Square Yard', factor: 0.836127 },
        { name: 'Square Foot', factor: 0.092903 },
        { name: 'Square Inch', factor: 0.00064516 },
        { name: 'Acre', factor: 4046.86 },
        { name: 'Hectare', factor: 10000 }
      ]
    },
    volume: {
      name: 'Volume',
      units: [
        { name: 'Cubic Meter', factor: 1 },
        { name: 'Cubic Centimeter', factor: 0.000001 },
        { name: 'Liter', factor: 0.001 },
        { name: 'Milliliter', factor: 0.000001 },
        { name: 'Gallon (US)', factor: 0.00378541 },
        { name: 'Quart (US)', factor: 0.000946353 },
        { name: 'Pint (US)', factor: 0.000473176 },
        { name: 'Cup (US)', factor: 0.000236588 },
        { name: 'Fluid Ounce (US)', factor: 0.0000295735 },
        { name: 'Tablespoon (US)', factor: 0.0000147868 },
        { name: 'Teaspoon (US)', factor: 0.00000492892 }
      ]
    },
    time: {
      name: 'Time',
      units: [
        { name: 'Second', factor: 1 },
        { name: 'Millisecond', factor: 0.001 },
        { name: 'Minute', factor: 60 },
        { name: 'Hour', factor: 3600 },
        { name: 'Day', factor: 86400 },
        { name: 'Week', factor: 604800 },
        { name: 'Month (30 days)', factor: 2592000 },
        { name: 'Year (365 days)', factor: 31536000 }
      ]
    },
    speed: {
      name: 'Speed',
      units: [
        { name: 'Meter per Second', factor: 1 },
        { name: 'Kilometer per Hour', factor: 0.277778 },
        { name: 'Mile per Hour', factor: 0.44704 },
        { name: 'Knot', factor: 0.514444 },
        { name: 'Foot per Second', factor: 0.3048 }
      ]
    }
  };

  // Initialize default units when component mounts
  useEffect(() => {
    const category = conversionCategories[selectedCategory];
    if (category && category.units.length >= 2) {
      setFromUnit(category.units[0].name);
      setToUnit(category.units[1].name);
    }
  }, []);

  // Handle category change
  const handleCategoryChange = (event: SelectChangeEvent) => {
    const newCategory = event.target.value;
    const category = conversionCategories[newCategory];
    
    // Immediately reset units when category changes to prevent invalid unit errors
    if (category && category.units.length >= 2) {
      setFromUnit(category.units[0].name);
      setToUnit(category.units[1].name);
    }
    
    setSelectedCategory(newCategory);
  };
  
  // Swap from and to units
  const handleSwapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
  };

  useEffect(() => {
    convertUnit();
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const convertUnit = () => {
    // If we're in the middle of changing categories, don't try to convert yet
    if (!conversionCategories[selectedCategory]) {
      return;
    }
    
    // Check if the units are valid for the current category
    const currentCategory = conversionCategories[selectedCategory];
    const isFromUnitValid = currentCategory.units.some(unit => unit.name === fromUnit);
    const isToUnitValid = currentCategory.units.some(unit => unit.name === toUnit);
    
    if (!isFromUnitValid || !isToUnitValid) {
      return;
    }
    if (!inputValue || !fromUnit || !toUnit) {
      setResult('');
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Invalid input');
      return;
    }

    const category = conversionCategories[selectedCategory];
    if (!category) {
      setResult('Invalid category');
      return;
    }

    const fromUnitObj = category.units.find(unit => unit.name === fromUnit);
    const toUnitObj = category.units.find(unit => unit.name === toUnit);

    if (!fromUnitObj || !toUnitObj) {
      setResult('Invalid unit');
      return;
    }

    // Special case for temperature
    if (selectedCategory === 'temperature') {
      let celsius;
      
      // Convert input to Celsius first
      if (fromUnit === 'Celsius') {
        celsius = value;
      } else if (fromUnit === 'Fahrenheit') {
        celsius = (value - 32) * 5/9;
      } else if (fromUnit === 'Kelvin') {
        celsius = value - 273.15;
      }
      
      // Convert Celsius to target unit
      let result = 0;
      if (celsius !== undefined) {
        if (toUnit === 'Celsius') {
          result = celsius;
        } else if (toUnit === 'Fahrenheit') {
          result = celsius * 9/5 + 32;
        } else if (toUnit === 'Kelvin') {
          result = celsius + 273.15;
        }
        
        setResult(result.toFixed(6));
      }
    } else {
      // Standard conversion using factors
      const baseValue = value * fromUnitObj.factor;
      const convertedValue = baseValue / toUnitObj.factor;
      setResult(convertedValue.toFixed(6));
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unit Converter
        </Typography>
        <Typography variant="body1" paragraph>
          Convert between different units of measurement.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              {Object.entries(conversionCategories).map(([key, category]) => (
                <MenuItem key={key} value={key}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: { md: 5 } }}>
              <TextField
                label="Value"
                fullWidth
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                type="number"
              />
            </Box>
            <Box sx={{ flex: { md: 7 } }}>
              <FormControl fullWidth>
                <InputLabel>From</InputLabel>
                <Select
                  value={fromUnit}
                  label="From"
                  onChange={(e: SelectChangeEvent) => setFromUnit(e.target.value)}
                >
                  {conversionCategories[selectedCategory]?.units.map(unit => (
                    <MenuItem key={unit.name} value={unit.name}>{unit.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Swap button row */}
          <Box sx={{ display: 'flex', mb: 3 }}>
            <Box sx={{ flex: { md: 5 } }}>
              {/* Empty space on the left */}
            </Box>
            <Box sx={{ flex: { md: 7 }, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end', pr: 2 }}>
                <Tooltip title="Swap units">
                  <IconButton 
                    onClick={handleSwapUnits} 
                    color="primary" 
                    size="small"
                    sx={{ 
                      border: '1px solid', 
                      borderColor: 'divider',
                      borderRadius: '50%',
                      p: 1,
                      mb: 1
                    }}
                  >
                    <SwapVertIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: { md: 5 } }}>
              <TextField
                label="Result"
                fullWidth
                value={result}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box sx={{ flex: { md: 7 } }}>
              <FormControl fullWidth>
                <InputLabel>To</InputLabel>
                <Select
                  value={toUnit}
                  label="To"
                  onChange={(e: SelectChangeEvent) => setToUnit(e.target.value)}
                >
                  {conversionCategories[selectedCategory]?.units.map(unit => (
                    <MenuItem key={unit.name} value={unit.name}>{unit.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {fromUnit && toUnit && `1 ${fromUnit} = ${
              selectedCategory === 'temperature' 
                ? '...' 
                : (conversionCategories[selectedCategory]?.units.find(u => u.name === fromUnit)?.factor || 0) / 
                  (conversionCategories[selectedCategory]?.units.find(u => u.name === toUnit)?.factor || 1)
            } ${toUnit}`}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnitConverterPage;
