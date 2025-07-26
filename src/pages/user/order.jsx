import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TrackOrder from './trackorder';

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-2 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Order Tracking</h1>
      {/* Grid Layout */}
      <div className="w-full max-w-5xl grid grid-rows-[1.2fr_1fr] grid-cols-2 gap-8">
        {/* Live Order Status - spans both columns */}
        <Card className="row-start-1 row-end-2 col-span-2 rounded-3xl flex flex-col justify-between">
          <CardContent className="pt-6 px-8 flex flex-col gap-4 w-full">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4 w-full">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-gray-800">Live Order Tracking</span>
                <span className="text-base font-medium text-gray-500 mt-1">Order #521459</span>
              </div>
              <span className="text-sm text-gray-500 ml-auto">user1234@email.com</span>
            </div>
            <div className="w-full">
              <TrackOrder />
            </div>
          </CardContent>
        </Card>
        {/* Info to share with restaurant */}
        <Card className="row-start-2 col-start-1 rounded-3xl shadow-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800 mb-2">The following information need to be shared with restaurant</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-gray-800 text-lg">
            <div><span className="font-bold text-xl">OTP:</span> <span className="font-mono">2759</span></div>
            <div><span className="font-bold text-xl">Token Number:</span> <span className="font-mono">12</span></div>
            <div><span className="font-bold text-xl">PickUp Time:</span> <span className="font-mono">11:30</span></div>
          </CardContent>
          <CardFooter className="pt-2 pb-6 flex justify-center">
            <Button className="w-full max-w-xs text-base font-semibold py-2 rounded-xl" size="lg">View Queue</Button>
          </CardFooter>
        </Card>
        {/* Order Details */}
        <Card className="row-start-2 col-start-2 rounded-3xl shadow-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800 mb-2">Order details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-2 text-gray-700 text-base">
              <div className="flex justify-between"><span>Samosa Chaat</span><span>x2</span></div>
              <div className="flex justify-between"><span>Masala Dosa</span><span>x1</span></div>
              <div className="flex justify-between"><span>Paneer Butter Masala Combo</span><span>x1</span></div>
            </div>
            <div className="flex justify-end items-end mt-8">
              <span className="text-lg font-bold text-gray-900">total amount: 556rs</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
