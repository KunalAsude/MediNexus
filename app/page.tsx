
import Dashboard from "./dashboard/page";
import CoverPage from "./main/page";



const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";
  
  return (
    <>
    <CoverPage/>
    </>
  )
}

export default Home
