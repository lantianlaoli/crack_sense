import ArticleForm from '@/components/ArticleForm'

export default function NewArticlePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
        <p className="text-gray-600 mt-2">Write a new blog post for CrackCheck</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ArticleForm />
      </div>
    </div>
  )
}