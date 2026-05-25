public function up(): void
{
    Schema::create('subscriptions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('customer_id')->constrained('customers');
        $table->foreignId('service_id')->constrained('services');
        $table->date('start_date')->nullable();
        $table->date('end_date')->nullable();
        $table->string('status');
        $table->timestamps();
    });
}