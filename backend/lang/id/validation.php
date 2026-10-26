<?php

return [
    'required' => ':attribute wajib diisi.',
    'string' => ':attribute harus berupa teks.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'lowercase' => ':attribute harus berupa huruf kecil.',
    'integer' => ':attribute harus berupa bilangan bulat.',
    'unique' => ':attribute sudah digunakan.',
    'exists' => ':attribute yang dipilih tidak valid.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'date_format' => ':attribute tidak sesuai format :format.',
    'min' => [
        'string' => ':attribute minimal :min karakter.',
        'numeric' => ':attribute minimal :min.',
    ],
    'max' => [
        'string' => ':attribute maksimal :max karakter.',
        'numeric' => ':attribute maksimal :max.',
    ],
    'attributes' => [
        'name' => 'Nama',
        'email' => 'Email',
        'password' => 'Password',
        'category_id' => 'Kategori',
        'amount' => 'Jumlah',
        'occurred_on' => 'Tanggal',
        'note' => 'Catatan',
        'month' => 'Bulan',
    ],
];
