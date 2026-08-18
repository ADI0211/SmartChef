// Horizontal, side-scrolling list of the user's current ingredients.
export default function FridgeScroller({ ingredients }) {
  if (ingredients.length === 0) {
    return <p className="empty-hint">No ingredients yet - add some with the + button below.</p>;
  }

  return (
    <div className="fridge-scroller">
      {ingredients.map((ingredient) => (
        <div className="fridge-chip" key={ingredient.id}>
          {ingredient.name}
          <span className="qty">
            {ingredient.quantity} {ingredient.unit}
          </span>
        </div>
      ))}
    </div>
  );
}
