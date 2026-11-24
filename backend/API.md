# BiteRush API (prototype)

**Base URL (local):** `http://localhost:5000/api`  
**Content-Type:** `application/json` for JSON request bodies. CORS is enabled for `/api/*`.  
**Database:** SQLite database file `backend/biterush.db`, created and seeded on first run.  
**Admin note:** prototype admin endpoints are not authenticated. Do not deploy them publicly until authentication/authorization is added.

## Run locally
From the `backend` folder:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

API listens on `http://127.0.0.1:5000`. It can be reached by other devices on your LAN using your PC's LAN IP if firewall allows. This is not a public URL.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | List menu; optional `category`, `search`, `available=true` |
| GET | `/api/menu/categories` | Categories |
| GET | `/api/menu/{food_id}` | Single menu item |
| POST | `/api/orders` | Place order; prices/totals are server-calculated |
| GET | `/api/orders/{order_id}` | Track order by generated ID |
| GET | `/api/admin/orders` | List orders; optional `status` filter |
| PATCH | `/api/admin/orders/{order_id}/status` | Update order status |
| POST | `/api/admin/menu` | Add food item |
| PUT | `/api/admin/menu/{food_id}` | Edit food item fields |
| PATCH | `/api/admin/menu/{food_id}/availability` | Set availability |
| DELETE | `/api/admin/menu/{food_id}` | Disable item (soft delete; retains order history) |

### Menu list sample
`GET /api/menu?category=Snacks&available=true`
```json
{
  "success": true,
  "count": 2,
  "items": [
    {"id":1,"name":"Veg Sandwich","category":"Snacks","price":60,"description":"Toasted sandwich with fresh vegetables and cheese.","image":"assets/Veg Sandwich.jpg","available":true},
    {"id":2,"name":"Cheese Sandwich","category":"Snacks","price":70,"description":"Grilled sandwich filled with delicious melted cheese.","image":"assets/Cheese Sandwich.jpg","available":true}
  ]
}
```

### Place order sample
`POST /api/orders`
```json
{
  "items": [{"food_id":1,"quantity":2},{"food_id":6,"quantity":1}],
  "pickup_time":"2026-11-24T12:40:00+05:30",
  "payment_method":"UPI"
}
```
The backend looks up each food ID, rejects unavailable items, calculates each line amount and total using the database price, and generates an order code.

Sample response (IDs and timestamps are illustrative):
```json
{
  "success": true,
  "message": "Order placed. Pay and collect at the canteen.",
  "order": {
    "order_id":"BR-20261124-A1B2C3",
    "pickup_time":"2026-11-24T12:40:00+05:30",
    "payment_method":"UPI",
    "status":"Pending",
    "total":170,
  "items":[
    {"food_id":1,"food_name":"Veg Sandwich","unit_price":60,"quantity":2,"line_total":120},
    {"food_id":6,"food_name":"Cold Coffee","unit_price":50,"quantity":1,"line_total":50}
  ]
  }
}
```

### Track order sample
`GET /api/orders/BR-20261124-A1B2C3`
```json
{"success":true,"order":{"order_id":"BR-20261124-A1B2C3","status":"Preparing","pickup_time":"2026-11-24T12:40:00+05:30","payment_method":"UPI","total":170,"items":[{"food_id":1,"food_name":"Veg Sandwich","unit_price":60,"quantity":2,"line_total":120},{"food_id":6,"food_name":"Cold Coffee","unit_price":50,"quantity":1,"line_total":50}],"created_at":"2026-11-24T07:10:00+00:00"}}
```

### Update status sample
`PATCH /api/admin/orders/BR-20261124-A1B2C3/status`
```json
{"status":"Ready"}
```
Valid statuses: `Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`.

### Add menu item sample
`POST /api/admin/menu`
```json
{"name":"Paneer Tikka","category":"Snacks","price":85,"description":"Paneer snack","image":"assets/paneer-tikka.jpg","available":true}
```

### Edit menu item sample
`PUT /api/admin/menu/1`
```json
{"price":65,"description":"Updated description","available":true}
```

### Availability sample
`PATCH /api/admin/menu/1/availability`
```json
{"available":false}
```

### Disable menu item
`DELETE /api/admin/menu/1` - disables the food instead of permanently deleting it, preserving historical order data.

### Error shape
```json
{"success":false,"error":"Readable error message"}
```
Common codes: `400` invalid request, `404` missing food/order, `409` food item currently unavailable.

## Frontend integration notes
- Replace hardcoded menu data with `GET /api/menu` and map API `items` to the frontend's food-card data structure.
- At checkout, send only food IDs and quantities, pickup time, and payment method. Never send price/total as trusted values.
- Use returned `order.order_id` for confirmation/tracking.
- For tracking, poll `GET /api/orders/{order_id}` or refresh when the student requests.
- Admin endpoints currently have no authentication, appropriate only for local prototype testing.
- `localhost` works only on the same computer. A deployed frontend needs a deployed backend URL (and configured allowed origins) or the backend's LAN IP while on the same network.
