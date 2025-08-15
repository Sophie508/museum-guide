import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useRouter } from 'next/navigation';

const ResultsScreen = ({ score, total, onRestart }: { score: number, total: number, onRestart: () => void }) => {
  const router = useRouter();
  const percentage = Math.round((score / total) * 100);

  // Mock leaderboard data for preview
  const mockLeaderboardPreview = [
    { rank: 1, name: '01用户', score: '15/15' },
    { rank: 2, name: '02用户', score: '13/15' },
    { rank: 3, name: '03用户', score: '12/15' },
    { rank: 4, name: '04用户', score: '11/15' },
    { rank: 5, name: '05用户', score: '10/15' }
  ];

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">测验结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">恭喜您完成了所有题目！</h2>
            <p className="text-lg">得分: {score} / {total}</p>
            <p className="text-lg">正确率: {percentage}%</p>
          </div>
          <div className="mt-6 cursor-pointer" onClick={() => router.push('/leaderboard')}>
            <h3 className="text-xl font-semibold mb-2 text-center">排行榜预览</h3>
            <div className="space-y-2">
              {mockLeaderboardPreview.map((entry) => (
                <div key={entry.rank} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <span>{entry.rank}</span>
                  <span>{entry.name}</span>
                  <span>{entry.score}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={onRestart}
          >
            再次挑战
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsScreen;
