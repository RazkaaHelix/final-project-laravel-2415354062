<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $table = 'costumers';

    protected $fillable = ["customer_id", "name", "email", "phone", "address", "status"];

    protected function casts(): array
    {
        return [
            "status" => "boolean",
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}