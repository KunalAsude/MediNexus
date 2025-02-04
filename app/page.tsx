
import Dashboard from "./dashboard/Dashboard";



const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";
  
  return (
    <>
    <Dashboard/>
    </>
  )
}

export default Home
