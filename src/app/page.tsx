"use client"

import Github from './components/icons/github'
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  function handleLogin() {
    router.push(`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=user:email`)
  }

  return (
    <div onClick={handleLogin} className='flex p-5 justify-center'>
      <button className="bg-white flex p-2 rounded-md hover:cursor-pointer active:transform-scale-95 text-black max-w-max">
        <span className="pe-2">Login with github</span>
        <Github />
      </button>
    </div>
  )
}
