<?php

namespace App\Console\Commands;

use Database\Seeders\DemoSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('demo:reset')]
#[Description('Reset the demo account and its deterministic dataset')]
class ResetDemoAccount extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DemoSeeder $seeder): int
    {
        $demo = $seeder->reset();

        $this->info("Demo account reset: {$demo->email}");

        return self::SUCCESS;
    }
}
