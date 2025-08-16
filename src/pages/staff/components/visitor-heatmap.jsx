import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Users } from 'lucide-react';
import supabase from '@/lib/supabase';


const VisitorHeatmap = () => {
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderData();
        
        // Set up real-time subscription for updates
        const subscription = supabase
            .channel('visitor_heatmap_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions'
                },
                () => {
                    fetchOrderData();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchOrderData = async () => {
        try {
            setLoading(true);
            
            // Get all successful transactions
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('payment_status', 'success');

            if (error) throw error;

            // Process order data to create time-based patterns
            const timeSlots = [
                '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
                '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
                '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
                '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
            ];
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            const processedData = days.map(day => ({
                name: day,
                data: timeSlots.map(time => {
                    // Count orders for this time slot and day
                    const ordersInSlot = transactions.filter(t => {
                        const orderDate = new Date(t.created_at);
                        const orderDay = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
                        const orderTime = orderDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });
                        
                        return orderDay === day && orderTime === time;
                    });
                    
                    return {
                        x: time,
                        y: ordersInSlot.length
                    };
                })
            }));

            setOrderData(processedData);
        } catch (error) {
            console.error('Error fetching order data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate peak hours from real data
    const calculatePeakHours = () => {
        if (orderData.length === 0) return { peakHours: 'No data', busiestDay: 'No data' };
        
        // Find time slots with most orders
        const timeSlotCounts = {};
        orderData.forEach(day => {
            day.data.forEach(timeSlot => {
                if (!timeSlotCounts[timeSlot.x]) {
                    timeSlotCounts[timeSlot.x] = 0;
                }
                timeSlotCounts[timeSlot.x] += timeSlot.y;
            });
        });
        
        // Find busiest day
        const dayCounts = {};
        orderData.forEach(day => {
            dayCounts[day.name] = day.data.reduce((sum, slot) => sum + slot.y, 0);
        });
        
        const busiestDay = Object.keys(dayCounts).reduce((a, b) => 
            dayCounts[a] > dayCounts[b] ? a : b
        );
        
        // Find peak time slots (top 3)
        const sortedTimeSlots = Object.entries(timeSlotCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([time]) => time);
        
        const peakHours = sortedTimeSlots.join(' • ');
        
        return { peakHours, busiestDay };
    };

    const { peakHours, busiestDay } = calculatePeakHours();

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
            
            {loading ? (
                <div className="mt-2 flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading order patterns...</p>
                    </div>
                </div>
            ) : orderData.length === 0 ? (
                <div className="mt-2 flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No order data available</p>
                        <p className="text-gray-400 text-xs mt-1">Order patterns will appear here</p>
                    </div>
                </div>
            ) : (
                <div className="mt-2">
                    {/* Simple order time visualization */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {['Morning', 'Afternoon', 'Evening', 'Night'].map((period, index) => {
                            const periodOrders = orderData.reduce((sum, day) => {
                                const startIndex = index * 6;
                                const endIndex = startIndex + 6;
                                return sum + day.data.slice(startIndex, endIndex).reduce((daySum, slot) => daySum + slot.y, 0);
                            }, 0);
                            
                            return (
                                <div key={period} className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">{period}</div>
                                    <div className="text-lg font-bold text-gray-800">{periodOrders}</div>
                                    <div className="text-xs text-gray-400">orders</div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Day-wise order count */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {orderData.map((day, index) => {
                            const totalOrders = day.data.reduce((sum, slot) => sum + slot.y, 0);
                            return (
                                <div key={day.name} className="text-center">
                                    <div className="text-xs text-gray-500 mb-1">{day.name}</div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${
                                        totalOrders > 5 ? 'bg-orange-500 text-white' :
                                        totalOrders > 2 ? 'bg-orange-300 text-white' :
                                        totalOrders > 0 ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-400'
                                    }`}>
                                        {totalOrders}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <div className="mt-3 p-2.5 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Peak Hours:</span>
                    <span className="text-gray-700 font-medium">{peakHours}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="text-gray-500">Busiest:</span>
                    <span className="text-gray-700 font-medium">{busiestDay}</span>
                </div>
            </div>
        </div>
    );
};

export default VisitorHeatmap; 