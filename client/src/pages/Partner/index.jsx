import { Tabs } from 'antd'

import TheatreList from "./TheatreList";

function Partner() {

  const items = [
    {
      key: "1",
      label: "Cinemas",
      children: <TheatreList />
    }
  ]
  return (
    <>
      <Tabs items={items} />
    </>
  )
}

export default Partner