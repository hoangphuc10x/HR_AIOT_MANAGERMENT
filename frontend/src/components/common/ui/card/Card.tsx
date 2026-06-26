import CardItem from './CardItem';

export default function Card() {
  const sampleData = [
    {
      title: 'Total Employee',
      amount: '100',
    },
    {
      title: 'Male',
      amount: '50',
    },
    {
      title: 'Female',
      amount: '50',
    },
  ];

  return (
    <div className="flex justify-between">
      {sampleData.map((item, index) => {
        return <CardItem key={index} title={item.title} amount={item.amount} />;
      })}
    </div>
  );
}
