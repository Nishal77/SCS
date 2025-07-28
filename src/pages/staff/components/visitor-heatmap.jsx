import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const VisitorHeatmap = () => {
    // Generate visitor data for different time periods
    const generateVisitorData = () => {
        const timeSlots = [
            '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
            '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
            '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
            '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
        ];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        return days.map(day => ({
            name: day,
            data: timeSlots.map((time, index) => {
                let value = 0;
                
                // Create realistic peak patterns
                if (index >= 10 && index <= 13) { // 12:00 PM - 1:30 PM (lunch peak)
                    value = Math.floor(Math.random() * 35) + 65; // 65-100 visitors
                } else if (index >= 20 && index <= 23) { // 5:00 PM - 6:30 PM (dinner peak)
                    value = Math.floor(Math.random() * 30) + 55; // 55-85 visitors
                } else if (index >= 8 && index <= 9) { // 11:00 AM - 11:30 AM (pre-lunch)
                    value = Math.floor(Math.random() * 25) + 40; // 40-65 visitors
                } else if (index >= 14 && index <= 15) { // 2:00 PM - 2:30 PM (post-lunch)
                    value = Math.floor(Math.random() * 20) + 35; // 35-55 visitors
                } else if (index >= 4 && index <= 7) { // 9:00 AM - 10:30 AM (morning)
                    value = Math.floor(Math.random() * 20) + 25; // 25-45 visitors
                } else if (index >= 16 && index <= 19) { // 3:00 PM - 4:30 PM (afternoon)
                    value = Math.floor(Math.random() * 15) + 20; // 20-35 visitors
                } else if (index >= 0 && index <= 3) { // 7:00 AM - 8:30 AM (early morning)
                    value = Math.floor(Math.random() * 10) + 10; // 10-20 visitors
                } else {
                    value = Math.floor(Math.random() * 8) + 5; // 5-13 visitors
                }

                // Weekend adjustments
                if (day === 'Sat') {
                    value = Math.floor(value * 1.3); // 30% more on Saturday
                } else if (day === 'Sun') {
                    value = Math.floor(value * 0.7); // 30% less on Sunday
                }

                return {
                    x: time,
                    y: value
                };
            })
        }));
    };

    const [state] = useState({
        series: generateVisitorData(),
        options: {
            chart: {
                height: 260,
                type: 'heatmap',
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 600,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 300
                    }
                },
                background: 'transparent'
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#F97316"],
            title: {
                show: false
            },
            xaxis: {
                type: 'category',
                labels: {
                    style: {
                        colors: '#94A3B8',
                        fontSize: '8px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif'
                    },
                    rotate: -45,
                    rotateAlways: false
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#94A3B8',
                        fontSize: '9px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            plotOptions: {
                heatmap: {
                    radius: 4,
                    enableShades: true,
                    shadeIntensity: 0.5,
                    reverseNegativeShade: true,
                    distributed: false,
                    useFillColorAsStroke: false,
                    colorScale: {
                        ranges: [
                            {
                                from: 0,
                                to: 20,
                                color: '#FEF3C7',
                                name: 'Low'
                            },
                            {
                                from: 21,
                                to: 45,
                                color: '#FED7AA',
                                name: 'Medium'
                            },
                            {
                                from: 46,
                                to: 70,
                                color: '#FB923C',
                                name: 'High'
                            },
                            {
                                from: 71,
                                to: 100,
                                color: '#EA580C',
                                name: 'Peak'
                            }
                        ]
                    }
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '11px'
                },
                y: {
                    formatter: function(value) {
                        return value + ' visitors';
                    }
                }
            },
            grid: {
                show: false
            },
            stroke: {
                width: 0
            }
        }
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Visitor Peak Hours</h3>
                    <p className="text-xs text-gray-400 mt-0.5">7:00 AM - 6:30 PM</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-yellow-200"></div>
                        <span className="text-xs text-gray-400">Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-orange-200"></div>
                        <span className="text-xs text-gray-400">Med</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-orange-400"></div>
                        <span className="text-xs text-gray-400">High</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-orange-600"></div>
                        <span className="text-xs text-gray-400">Peak</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-2">
                <ReactApexChart 
                    options={state.options} 
                    series={state.series} 
                    type="heatmap" 
                    height={260}
                />
            </div>
            
            <div className="mt-3 p-2.5 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Peak Hours:</span>
                    <span className="text-gray-700 font-medium">12:00-1:30 PM • 5:00-6:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="text-gray-500">Busiest:</span>
                    <span className="text-gray-700 font-medium">Saturday</span>
                </div>
            </div>
        </div>
    );
};

export default VisitorHeatmap; 