"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TOPICS, GET_QUESTIONS } from "@/graphql/queries/curriculum";
import {
  CREATE_TOPIC,
  DELETE_TOPIC,
  CREATE_QUESTION,
} from "@/graphql/mutations/topics";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface TopicItem {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

interface QuestionItem {
  id: string;
  text: string;
  proficiencyLevel: string;
}

export default function ManageTopicsPage() {
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionLevel, setNewQuestionLevel] = useState("A1");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, refetch } = useQuery<any>(GET_TOPICS);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionsData, loading: questionsLoading } = useQuery<any>(
    GET_QUESTIONS,
    {
      variables: { topicId: expandedTopicId ? parseInt(expandedTopicId) : 0 },
      skip: !expandedTopicId,
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createTopic, { loading: creating }] = useMutation<any>(CREATE_TOPIC, {
    onCompleted: () => {
      setNewTopicName("");
      setNewTopicDesc("");
      refetch();
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deleteTopic] = useMutation<any>(DELETE_TOPIC, {
    onCompleted: () => {
      refetch();
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createQuestion, { loading: creatingQuestion }] = useMutation<any>(
    CREATE_QUESTION,
    {
      onCompleted: () => {
        setNewQuestionText("");
        refetch();
      },
      refetchQueries: [
        {
          query: GET_QUESTIONS,
          variables: {
            topicId: expandedTopicId ? parseInt(expandedTopicId) : 0,
          },
        },
      ],
    }
  );

  const topics: TopicItem[] = data?.topics ?? [];
  const questions: QuestionItem[] = questionsData?.questions ?? [];

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    createTopic({
      variables: { name: newTopicName.trim(), description: newTopicDesc.trim() },
    });
  };

  const handleDeleteTopic = (topicId: string, topicName: string) => {
    if (!confirm(`Delete topic "${topicName}" and all its questions?`)) return;
    if (expandedTopicId === topicId) setExpandedTopicId(null);
    deleteTopic({ variables: { topicId } });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !expandedTopicId) return;
    createQuestion({
      variables: {
        topicId: expandedTopicId,
        text: newQuestionText.trim(),
        proficiencyLevel: newQuestionLevel,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Topics</h1>

      {/* Add Topic Form */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Add New Topic
        </h2>
        <form onSubmit={handleCreateTopic} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Travel"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Brief description of the topic"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newTopicName.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Add Topic"}
          </button>
        </form>
      </Card>

      {/* Topics List */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Topics</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading topics...</p>
        ) : topics.length === 0 ? (
          <p className="text-sm text-gray-500">No topics yet.</p>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <div key={topic.id}>
                <div className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-3 hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTopicId(
                        expandedTopicId === topic.id ? null : topic.id
                      )
                    }
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {topic.name}
                      </span>
                      <Badge variant="default">
                        {topic.questionCount}{" "}
                        {topic.questionCount === 1 ? "question" : "questions"}
                      </Badge>
                    </div>
                    {topic.description && (
                      <p className="mt-1 text-xs text-gray-500">
                        {topic.description}
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id, topic.name)}
                    className="ml-4 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                {/* Expanded questions panel */}
                {expandedTopicId === topic.id && (
                  <div className="ml-4 mt-2 rounded-md border border-gray-100 bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">
                      Questions
                    </h3>
                    {questionsLoading ? (
                      <p className="text-xs text-gray-500">Loading...</p>
                    ) : questions.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No questions for this topic.
                      </p>
                    ) : (
                      <ul className="mb-4 space-y-2">
                        {questions.map((q) => (
                          <li
                            key={q.id}
                            className="flex items-start justify-between rounded border border-gray-200 bg-white px-3 py-2"
                          >
                            <span className="text-sm text-gray-700">
                              {q.text}
                            </span>
                            {q.proficiencyLevel && (
                              <Badge variant="tone" className="ml-2 shrink-0">
                                {q.proficiencyLevel}
                              </Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Add question form */}
                    <form
                      onSubmit={handleCreateQuestion}
                      className="flex items-end gap-2"
                    >
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          New Question
                        </label>
                        <input
                          type="text"
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Enter question text"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Level
                        </label>
                        <select
                          value={newQuestionLevel}
                          onChange={(e) => setNewQuestionLevel(e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="A1">A1</option>
                          <option value="A2">A2</option>
                          <option value="B1">B1</option>
                          <option value="B2">B2</option>
                          <option value="C1">C1</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={creatingQuestion || !newQuestionText.trim()}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {creatingQuestion ? "Adding..." : "Add"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
