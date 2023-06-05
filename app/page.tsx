'use client'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { githubLight } from '@uiw/codemirror-theme-github'
import { graphql } from 'cm6-graphql'
import { graphqlExample } from './example'
import { useEffect, useState } from 'react'
import { generateCode } from './../lib'
import { parse } from 'graphql'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [ts, setTS] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function onGQLChange(value: string) {
    try {
      const ast = parse(value)
      setTS(generateCode(ast, { generateTypes: true }))
      setErrorMessage('')
    } catch (e: any) {
      setTS('')
      setErrorMessage(e.message)
    }
  }

  useEffect(() => onGQLChange(graphqlExample), [])

  return (
    <main className="flex flex-col h-full">
      <div className="py-3 px-4 border-b bg-gray-100">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
            />
          </svg>
          <div className="ml-4 flex flex-1 flex-col">
            <h1 className="flex select-none font-medium text-base leading-5">
              <span>GraphQL</span>
              <span className="mx-1">⇢</span>
              <Image height={40} width={50} alt="garph" src="/garph.svg" />
            </h1>
            <span className="select-none text-sm text-neutral-600">
              Easily migrate your GraphQL SDL to Garph
            </span>
          </div>
          <nav className="flex">
            <Link
              href="https://github.com/stepci/gql2garph/issues/new"
              target='_blank'
              className="flex ml-2 p-2 select-none cursor-pointer font-medium text-sm"
            >
              Feedback
            </Link>
            <Link
              href="https://garph.dev/docs"
              target='_blank'
              className="flex ml-2 p-2 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full select-none cursor-pointer text-sm"
            >
              Docs
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 ml-2"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
      <div className="h-full grid md:grid-cols-2 grid-rows-2 md:grid-rows-1 overflow-x-hidden">
        <CodeMirror
          className="row-span-1 text-base md:border-r border-b md:border-b-0 overflow-x-scroll"
          value={graphqlExample}
          height="100%"
          theme={githubLight}
          onChange={onGQLChange}
          extensions={[graphql()]}
        />
        <CodeMirror
          className="row-span-1 text-base overflow-x-scroll"
          value={ts}
          height="100%"
          theme={githubLight}
          extensions={[javascript({ typescript: true })]}
          readOnly={true}
          placeholder={errorMessage}
        />
      </div>
      {/* <footer>Hello</footer> */}
    </main>
  )
}
