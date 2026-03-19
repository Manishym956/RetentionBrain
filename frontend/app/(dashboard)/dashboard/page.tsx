import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Users, TrendingDown, Activity, DollarSign } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">High-level metrics and model predictions for your users.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-white to-gray-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-4">12,450</p>
                        <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                            +12% <span className="text-gray-400 font-normal ml-1">last 30 days</span>
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-white to-gray-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Churn Risk Average</p>
                            <TrendingDown className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-4">24.5%</p>
                        <p className="text-sm text-red-600 font-medium mt-1 flex items-center">
                            +2.1% <span className="text-gray-400 font-normal ml-1">last 30 days</span>
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-white to-gray-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Revenue at Risk</p>
                            <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-4">$42,300</p>
                        <p className="text-sm text-yellow-600 font-medium mt-1 flex items-center">
                            High Priority
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-white to-gray-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-4">4</p>
                        <p className="text-sm text-blue-600 font-medium mt-1 flex items-center">
                            A/B Testing running
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recent High-Risk Users</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Activity Score</TableHead>
                                <TableHead className="text-right">Churn Probability</TableHead>
                            </TableRow>
                        </TableHeader>
                        <tbody className="divide-y divide-gray-100">
                            {[1,2,3,4,5].map(i => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">usr_a9{i}bf2</TableCell>
                                    <TableCell>Pro Tier</TableCell>
                                    <TableCell>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-orange-400 h-2.5 rounded-full" style={{ width: `${80 - i*10}%` }}></div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 font-semibold">{85 - i*5}%</TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
