<?php
/**
 * OST technical SEO fixes.
 *
 * Draft snippet for Code Snippets. Keep inactive until it is tested on staging.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ost_seo_clean_text( $text ) {
	$text = wp_strip_all_tags( (string) $text );
	$text = html_entity_decode( $text, ENT_QUOTES, get_bloginfo( 'charset' ) );
	$text = preg_replace( '/\s+/u', ' ', $text );

	return trim( $text );
}

function ost_seo_limit_text( $text, $limit = 155 ) {
	$text = ost_seo_clean_text( $text );

	if ( function_exists( 'mb_strlen' ) && mb_strlen( $text ) <= $limit ) {
		return $text;
	}

	if ( ! function_exists( 'mb_strlen' ) && strlen( $text ) <= $limit ) {
		return $text;
	}

	$cut = function_exists( 'mb_substr' ) ? mb_substr( $text, 0, $limit - 1 ) : substr( $text, 0, $limit - 1 );
	$cut = preg_replace( '/\s+\S*$/u', '', $cut );

	return rtrim( $cut, " \t\n\r\0\x0B.,;:-" ) . '.';
}

function ost_seo_queried_label() {
	$object = get_queried_object();

	if ( $object instanceof WP_Term ) {
		return ost_seo_clean_text( $object->name );
	}

	if ( is_post_type_archive( 'games' ) ) {
		return 'Games';
	}

	if ( is_home() ) {
		$page_id = (int) get_option( 'page_for_posts' );
		return $page_id ? ost_seo_clean_text( get_the_title( $page_id ) ) : 'Blog';
	}

	if ( is_singular() ) {
		return ost_seo_clean_text( get_the_title() );
	}

	return '';
}

function ost_seo_make_term_description( WP_Term $term ) {
	$name = ost_seo_clean_text( $term->name );

	switch ( $term->taxonomy ) {
		case 'providers':
			return ost_seo_limit_text( sprintf( 'Explore %s casino games on Online Slot Top. Compare slots, features, bonuses and trusted casinos before you play online.', $name ) );
		case 'casino':
			return ost_seo_limit_text( sprintf( 'Read the %s casino review on Online Slot Top. Check bonuses, games, payment options and key details before you play.', $name ) );
		case 'bonuses':
			return ost_seo_limit_text( sprintf( 'Find %s casino bonuses on Online Slot Top. Compare offers, free spins, terms and trusted casinos before claiming a deal.', $name ) );
		case 'functions':
			return ost_seo_limit_text( sprintf( 'Browse %s casino games on Online Slot Top. Compare slots, providers, bonuses and features before choosing where to play.', $name ) );
		case 'themes':
			return ost_seo_limit_text( sprintf( 'Discover %s casino games on Online Slot Top. Browse themed slots, providers, bonuses and trusted places to play online.', $name ) );
		case 'game_tags':
			return ost_seo_limit_text( sprintf( 'Explore %s casino games on Online Slot Top. Compare popular titles, providers, bonuses and ways to play online.', $name ) );
		case 'post_tag':
			return ost_seo_limit_text( sprintf( 'Read %s articles on Online Slot Top. Follow casino news, slot reviews, guides and useful online gambling updates.', $name ) );
		case 'category':
			return ost_seo_limit_text( sprintf( 'Read %s posts on Online Slot Top. Explore casino articles, slot reviews, guides and useful gambling insights.', $name ) );
		default:
			return '';
	}
}

function ost_seo_make_game_description() {
	if ( ! is_singular( 'games' ) ) {
		return '';
	}

	$title     = ost_seo_clean_text( get_the_title() );
	$provider  = '';
	$providers = get_the_terms( get_the_ID(), 'providers' );

	if ( is_array( $providers ) && ! empty( $providers ) && ! is_wp_error( $providers ) ) {
		$provider = ost_seo_clean_text( $providers[0]->name );
	}

	if ( $provider ) {
		return ost_seo_limit_text( sprintf( 'Play %s by %s online. Review features, volatility, bonuses and trusted casinos before you spin.', $title, $provider ) );
	}

	return ost_seo_limit_text( sprintf( 'Play %s online. Review features, volatility, bonuses and trusted casinos before you spin.', $title ) );
}

function ost_seo_make_archive_description() {
	if ( is_tax() || is_category() || is_tag() ) {
		$term = get_queried_object();
		if ( $term instanceof WP_Term ) {
			$term_description = ost_seo_clean_text( term_description( $term, $term->taxonomy ) );
			if ( $term_description ) {
				return ost_seo_limit_text( $term_description );
			}

			return ost_seo_make_term_description( $term );
		}
	}

	if ( is_post_type_archive( 'games' ) || is_page( 'games' ) ) {
		return 'Browse online casino games on Online Slot Top. Compare slots, providers, features and bonuses before choosing where to play.';
	}

	if ( is_page( 'providers' ) ) {
		return 'Compare casino game providers on Online Slot Top. Explore studios, popular slots, mechanics and trusted casinos to play online.';
	}

	if ( is_page( 'casinos' ) ) {
		return 'Compare online casinos on Online Slot Top. Check bonuses, games, payment options and key details before choosing where to play.';
	}

	if ( is_page( 'bonuses' ) ) {
		return 'Compare casino bonuses on Online Slot Top. Find free spins, deposit offers, bonus terms and trusted casinos in one place.';
	}

	if ( is_home() || is_page( 'blog' ) ) {
		return 'Read Online Slot Top casino guides, slot reviews, gambling news and practical tips for choosing trusted online casinos.';
	}

	if ( is_page( array( 'login', 'profile' ) ) ) {
		return 'Log in to your Online Slot Top account to manage your profile, saved casinos, bonuses and preferences.';
	}

	return '';
}

function ost_seo_is_nolimit_provider() {
	$term = get_queried_object();

	return $term instanceof WP_Term && 'providers' === $term->taxonomy && 'nolimit-city' === $term->slug;
}

function ost_seo_nolimit_title() {
	return 'NoLimit City Slots & Casino Games - Online Slot Top';
}

function ost_seo_replace_site_tokens( $value ) {
	if ( ! is_string( $value ) ) {
		return $value;
	}

	$value = str_replace( array( '%sitename%', '%sitetitle%' ), get_bloginfo( 'name' ), $value );
	$value = preg_replace( '/\s*&bull;\s*&bull;\s*/', ' &bull; ', $value );
	$value = preg_replace( '/\s{2,}/', ' ', $value );

	return trim( $value );
}

add_filter(
	'rank_math/frontend/title',
	function ( $title ) {
		if ( ost_seo_is_nolimit_provider() ) {
			return ost_seo_nolimit_title();
		}

		return ost_seo_replace_site_tokens( $title );
	},
	20
);

foreach ( array( 'facebook', 'twitter' ) as $ost_seo_network ) {
	add_filter(
		"rank_math/opengraph/{$ost_seo_network}/title",
		function ( $title ) {
			if ( ost_seo_is_nolimit_provider() ) {
				return ost_seo_nolimit_title();
			}

			return ost_seo_replace_site_tokens( $title );
		},
		20
	);
}

add_filter(
	'rank_math/json_ld',
	function ( $data ) {
		array_walk_recursive(
			$data,
			function ( &$value ) {
				$value = ost_seo_replace_site_tokens( $value );
			}
		);

		if ( ost_seo_is_nolimit_provider() ) {
			foreach ( $data as &$entity ) {
				if ( is_array( $entity ) && isset( $entity['@type'] ) && 'CollectionPage' === $entity['@type'] ) {
					$entity['name'] = ost_seo_nolimit_title();
				}
			}
			unset( $entity );
		}

		return $data;
	},
	20
);

add_filter(
	'rank_math/frontend/description',
	function ( $description ) {
		$description = ost_seo_clean_text( $description );

		if ( is_singular( 'games' ) && ( ! $description || ( function_exists( 'mb_strlen' ) ? mb_strlen( $description ) > 160 : strlen( $description ) > 160 ) ) ) {
			$game_description = ost_seo_make_game_description();
			return $game_description ? $game_description : ost_seo_limit_text( $description );
		}

		if ( is_tax() || is_category() || is_tag() || is_post_type_archive( 'games' ) || is_home() || is_page( array( 'games', 'providers', 'casinos', 'bonuses', 'blog', 'login', 'profile' ) ) ) {
			if ( ! $description || ( function_exists( 'mb_strlen' ) ? mb_strlen( $description ) > 160 : strlen( $description ) > 160 ) ) {
				$archive_description = ost_seo_make_archive_description();
				if ( $archive_description ) {
					return $archive_description;
				}
			}
		}

		return $description;
	},
	20
);

add_filter(
	'rank_math/sitemap/entry',
	function ( $url, $type, $object ) {
		if ( empty( $url['loc'] ) ) {
			return $url;
		}

		$excluded_paths = array(
			'/profile/',
			'/casino/gold-bet/one-time-offer-4-500-eur-200-fs-welcome-bonus/',
			'/casino/gold-bet/200-high-roller/',
			'/casino/gold-bet/150-crypto-deposit/',
			'/casino/neon-club/deposit-bonus-fiat/',
			'/casino/1win/crypto-deposit-bonus/',
			'/casino/1win/500-deposit-bonus-free-spins/',
			'/casino/vavada/100-free-spins-for-registration/',
			'/casino/vavada/100-first-deposit-bonus/',
			'/casino/gold-bet/20-registration-bonus/',
			'/themes/classic/',
		);

		$path = wp_parse_url( $url['loc'], PHP_URL_PATH );
		$path = trailingslashit( (string) $path );

		if ( in_array( $path, $excluded_paths, true ) ) {
			return false;
		}

		return $url;
	},
	20,
	3
);

function ost_seo_should_fix_h1() {
	return is_tax( array( 'providers', 'game_tags', 'functions', 'themes', 'bonuses', 'casino' ) )
		|| is_category()
		|| is_tag()
		|| is_post_type_archive( 'games' )
		|| is_home()
		|| is_singular( 'post' )
		|| is_page( array( 'blog', 'casinos', 'providers', 'games', 'login', 'profile' ) );
}

function ost_seo_h1_output_buffer( $html ) {
	if ( false !== stripos( $html, '<h1' ) ) {
		return $html;
	}

	$label = ost_seo_queried_label();
	if ( ! $label ) {
		return $html;
	}

	$quoted_label = preg_quote( $label, '/' );
	$patterns     = array(
		'/<h2([^>]*)>\s*<span>\s*(' . $quoted_label . ')\s*<\/span>\s*<\/h2>/iu',
		'/<h2([^>]*)>\s*(' . $quoted_label . ')\s*<\/h2>/iu',
	);

	foreach ( $patterns as $pattern ) {
		$count = 0;
		$html  = preg_replace( $pattern, '<h1$1>$2</h1>', $html, 1, $count );
		if ( $count ) {
			return $html;
		}
	}

	return $html;
}

add_action(
	'template_redirect',
	function () {
		if ( ! is_admin() && ! wp_doing_ajax() && ost_seo_should_fix_h1() ) {
			ob_start( 'ost_seo_h1_output_buffer' );
		}
	},
	0
);
