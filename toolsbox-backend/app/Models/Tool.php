<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'category_id',
        'icon',
        'route',
        'is_popular',
        'is_new',
        'is_active',
        'display_order'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_popular' => 'boolean',
        'is_new' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category that owns the tool.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the users who have favorited this tool.
     */
    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }
}
