import { Card, CardContent } from './ui/Card'
import { Progress } from './ui/Progress'

interface ScoreCardProps {
  score: number
  label: string
  maxScore?: number
  size?: 'sm' | 'lg'
}

export function ScoreCard({ score, label, maxScore = 10, size = 'sm' }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100

  const getGrade = () => {
    if (percentage >= 90) return { letter: 'A', color: 'text-green-600 dark:text-green-400' }
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-600 dark:text-blue-400' }
    if (percentage >= 70) return { letter: 'C', color: 'text-yellow-600 dark:text-yellow-400' }
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-600 dark:text-orange-400' }
    return { letter: 'F', color: 'text-red-600 dark:text-red-400' }
  }

  const grade = getGrade()

  if (size === 'lg') {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-5xl font-bold ${grade.color}`}>
              {score.toFixed(1)}
            </span>
            <span className="text-2xl text-gray-400">/ {maxScore}</span>
          </div>
          <div className={`mt-2 text-lg font-semibold ${grade.color}`}>
            Grade: {grade.letter}
          </div>
          <Progress value={score} max={maxScore} size="lg" className="mt-4" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className={`text-sm font-semibold ${grade.color}`}>
            {score.toFixed(1)}/{maxScore}
          </span>
        </div>
        <Progress value={score} max={maxScore} size="sm" />
      </div>
    </div>
  )
}
