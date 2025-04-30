import { filterLeague } from "@/api"
import LeagueTable from "@/app/components/LeagueTable"



const CopaLibertadores = async () => {
  const getBundesliga = await filterLeague('Copa Libertadores')
  return (
    <div className='w-[600px]'>
      {getBundesliga.map((data) => (
        <div key={data.id}>
          <LeagueTable data={data} />
        </div>
      ))}
    </div>
  )
}

export default CopaLibertadores