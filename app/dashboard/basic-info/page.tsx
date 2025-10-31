import BasicInfo from './_components/basicinfo'

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-semibold">Basic Info</h2>
        <p className="text-muted-foreground text-sm">Use basic property information</p>
      </div>
      <BasicInfo />
    </div>
  )
}

export default Page