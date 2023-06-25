import Github from './components/icons/github'

export default function Home() {
  return (
    <div className='flex p-5 justify-center'>
      <button className="bg-white flex p-2 rounded-md hover:cursor-pointer active:transform-scale-95 text-black max-w-max">
        <span className="pe-2">Login with github</span>
        <Github />
      </button>
    </div>
  )
}
