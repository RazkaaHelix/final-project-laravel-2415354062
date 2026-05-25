<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Subscription;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a default test user
        User::factory()->create([
            'name' => 'Admin ERP',
            'email' => 'admin@erp.com',
        ]);

        // 2. Create Services
        $serviceA = Service::create([
            'name' => 'Service A',
            'price' => 1000000,
            'description' => 'Premium High-Speed Fiber Internet Connection',
            'status' => true,
        ]);

        $serviceB = Service::create([
            'name' => 'Service B',
            'price' => 250000,
            'description' => 'Managed Local Area Network & Wi-Fi support',
            'status' => true,
        ]);

        $serviceC = Service::create([
            'name' => 'Service C',
            'price' => 450000,
            'description' => 'Cloud backup storage & Dedicated IP Address',
            'status' => true,
        ]);

        // 3. Create Customers (Note: table is 'costumers')
        $customerAlice = Customer::create([
            'customer_id' => '2211024317',
            'name' => 'Alice Johnson',
            'email' => 'alice@gmail.com',
            'phone' => '+6281234567890',
            'address' => 'Green Street',
            'status' => true, // Active
        ]);

        $customerBob = Customer::create([
            'customer_id' => '021423458',
            'name' => 'Bob Smith',
            'email' => 'bob@gmail.com',
            'phone' => '+6281298765432',
            'address' => 'Maple Avenue',
            'status' => false, // Inactive (matching Deactivate badge)
        ]);

        $customerCarol = Customer::create([
            'customer_id' => '1011012359',
            'name' => 'Carol White',
            'email' => 'carol@gmail.com',
            'phone' => '+6281311223344',
            'address' => 'Pine Road',
            'status' => true, // Active
        ]);

        $customerDavid = Customer::create([
            'customer_id' => '031405963',
            'name' => 'David Brown',
            'email' => 'david@gmail.com',
            'phone' => '+6281355667788',
            'address' => 'Elm Street',
            'status' => true, // Active
        ]);

        // 4. Create Subscriptions
        Subscription::create([
            'customer_id' => $customerAlice->id,
            'service_id' => $serviceA->id,
            'start_date' => '2026-01-01',
            'end_date' => '2027-07-01',
            'status' => 'active',
        ]);

        Subscription::create([
            'customer_id' => $customerBob->id,
            'service_id' => $serviceB->id,
            'start_date' => '2026-02-15',
            'end_date' => '2027-02-15',
            'status' => 'trial',
        ]);

        Subscription::create([
            'customer_id' => $customerCarol->id,
            'service_id' => $serviceC->id,
            'start_date' => '2026-03-10',
            'end_date' => '2027-03-10',
            'status' => 'isolir',
        ]);

        Subscription::create([
            'customer_id' => $customerDavid->id,
            'service_id' => $serviceA->id,
            'start_date' => '2025-04-05',
            'end_date' => '2029-04-05',
            'status' => 'dismantle',
        ]);
    }
}
