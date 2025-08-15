import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const LeaderboardScreen = () => {
  // Mock full leaderboard data
  const mockLeaderboard = [
    { rank: 1, name: '01用户', score: '15/15' },
    { rank: 2, name: '02用户', score: '13/15' },
    { rank: 3, name: '03用户', score: '12/15' },
    { rank: 4, name: '04用户', score: '11/15' },
    { rank: 5, name: '05用户', score: '10/15' },
    { rank: 6, name: '06用户', score: '9/15' },
    { rank: 7, name: '07用户', score: '8/15' },
    { rank: 8, name: '08用户', score: '7/15' },
    { rank: 9, name: '09用户', score: '6/15' },
    { rank: 10, name: '10用户', score: '5/15' }
  ];

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">吴文化知识达人排行榜</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockLeaderboard.map((entry) => (
              <div key={entry.rank} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <span>{entry.rank}</span>
                <span>{entry.name}</span>
                <span>{entry.score}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <img 
              src="/placeholder-logo.png" 
              alt="吴文化博物馆" 
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardScreen;
