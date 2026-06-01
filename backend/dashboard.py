import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import requests
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Page config ──
st.set_page_config(
    page_title="HeroClash Dashboard",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Custom CSS ──
st.markdown("""
<style>
    .stApp { background-color: #0a0a0f; color: white; }
    .metric-card {
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
    }
    .section-header {
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 0.1em;
        margin: 20px 0 10px 0;
    }
    div[data-testid="stMetric"] {
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 16px;
    }
    div[data-testid="stMetric"] {
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 16px;
    }
    div[data-testid="stMetricValue"] {
        font-size: 2rem !important;
        font-weight: 900 !important;
        color: #FFD700 !important;
    }
    div[data-testid="stMetricLabel"] {
        font-size: 0.75rem !important;
        color: rgba(255,255,255,0.6) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.1em !important;
    }
</style>
""", unsafe_allow_html=True)

# ── Load Data ──
@st.cache_data
def load_heroes():
    path = os.path.join(BASE_DIR, "app/data/heroes.json")
    with open(path) as f:
        return json.load(f)

@st.cache_data
def load_deck():
    path = os.path.join(BASE_DIR, "app/data/deck.json")
    with open(path) as f:
        return json.load(f)

def load_game_stats():
    try:
        response = requests.get("http://localhost:8000/api/game/stats")
        return response.json()
    except:
        return None

def load_game_history():
    try:
        response = requests.get("http://localhost:8000/api/game/history")
        return response.json().get("games", [])
    except:
        return []

# ── Build DataFrame ──
@st.cache_data
def build_df():
    heroes = load_heroes()
    stats_list = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat']
    rows = []
    for hero in heroes:
        stats = hero["powerstats"]
        bio = hero["biography"]
        appearance = hero["appearance"]
        try:
            row = {
                "name": hero["name"],
                "publisher": bio["publisher"],
                "alignment": bio["alignment"],
                "gender": appearance["gender"],
                "race": appearance["race"],
                "intelligence": int(stats["intelligence"]),
                "strength": int(stats["strength"]),
                "speed": int(stats["speed"]),
                "durability": int(stats["durability"]),
                "power": int(stats["power"]),
                "combat": int(stats["combat"]),
            }
            row["power_score"] = round(sum(row[s] for s in stats_list) / 6, 1)
            rows.append(row)
        except:
            pass
    return pd.DataFrame(rows)

# ── Sidebar ──
logo_path = os.path.join(BASE_DIR, "../frontend/public/logo.png")
if os.path.exists(logo_path):
    st.sidebar.image(logo_path, use_container_width=True)
else:
    st.sidebar.markdown("# ⚡ HEROCLASH")
st.sidebar.markdown("---")
section = st.sidebar.radio(
    "Navigate",
    [
        "◆  Overview",
        "◈  Hero Analysis", 
        "▲  Power Rankings",
        "◉  Race Analysis",
        "◇  Deck Intelligence",
        "▶  Game Stats"
    ]
)
st.sidebar.markdown("---")
st.sidebar.markdown("**HeroClash Analytics**")
st.sidebar.markdown("731 heroes • 428 valid • 52 per game")
st.sidebar.markdown("20 Marvel + 20 DC + 12 Wildcards")


df = build_df()
stats_list = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat']
marvel_dc = df[df['publisher'].isin(['Marvel Comics', 'DC Comics'])]
valid = df.copy()

MARVEL_RED = '#C41E3A'
DC_BLUE = '#0057B8'
GOLD = '#FFD700'

# ════════════════════════════════
# 🏠 OVERVIEW
# ════════════════════════════════
if section == "◆  Overview":
    st.markdown("# ◆ HEROCLASH ANALYTICS DASHBOARD")
    st.markdown("### Marvel vs DC vs Everyone • 731 Heroes • Data Science Deep Dive")
    st.markdown("""
    > **Dynamic Deck System** — Every game deals a fresh random 22 Marvel + 22 DC + 8 wildcard 
    > heroes and villains sampled from 428 valid characters. K-Means clustering was used to 
    > validate deck balance — our algorithm produces statistically superior decks vs random sampling 
    > across 5 of 6 stat categories.
    """)
    st.markdown("---")

    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric("Total", "731")
    col2.metric("Valid", str(len(valid)))
    col3.metric("Marvel", str(len(df[df['publisher'] == 'Marvel Comics'])))
    col4.metric("DC", str(len(df[df['publisher'] == 'DC Comics'])))
    col5.metric("Per Game", "52")

    st.markdown("---")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### Publisher Breakdown")
        pub_counts = df['publisher'].value_counts().head(8)
        fig = px.bar(
            x=pub_counts.values, y=pub_counts.index,
            orientation='h',
            color=pub_counts.values,
            color_continuous_scale='RdBu',
            template='plotly_dark'
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            showlegend=False,
            coloraxis_showscale=False,
            height=350
        )
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown("#### Marvel vs DC Split")
        counts = marvel_dc['publisher'].value_counts()
        fig = px.pie(
            values=counts.values,
            names=counts.index,
            color=counts.index,
            color_discrete_map={
                'Marvel Comics': MARVEL_RED,
                'DC Comics': DC_BLUE
            },
            template='plotly_dark',
            hole=0.4
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            height=350
        )
        st.plotly_chart(fig, use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### Gender Distribution")
        gender = df['gender'].value_counts()
        fig = px.bar(
            x=gender.index, y=gender.values,
            color=gender.index,
            color_discrete_map={'Male': DC_BLUE, 'Female': '#E91E63', '-': '#666'},
            template='plotly_dark'
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            showlegend=False, height=300
        )
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown("#### Alignment Breakdown")
        alignment = df['alignment'].value_counts()
        fig = px.pie(
            values=alignment.values,
            names=alignment.index,
            color=alignment.index,
            color_discrete_map={
                'good': '#2ECC71', 'bad': MARVEL_RED,
                'neutral': '#95A5A6', '-': '#555'
            },
            template='plotly_dark',
            hole=0.4
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            height=300
        )
        st.plotly_chart(fig, use_container_width=True)

# ════════════════════════════════
# ⚡ HERO ANALYSIS
# ════════════════════════════════
elif section == "◈  Hero Analysis":
    st.markdown("# ◈ HERO STAT ANALYSIS")
    st.markdown("---")

    st.markdown("#### Average Stats — Marvel vs DC")
    avg_stats = marvel_dc.groupby('publisher')[stats_list].mean().round(1)
    fig = go.Figure()
    fig.add_trace(go.Bar(
        name='Marvel', x=stats_list,
        y=avg_stats.loc['Marvel Comics'],
        marker_color=MARVEL_RED
    ))
    fig.add_trace(go.Bar(
        name='DC', x=stats_list,
        y=avg_stats.loc['DC Comics'],
        marker_color=DC_BLUE
    ))
    fig.update_layout(
        barmode='group', template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("#### Stat Correlation Heatmap")
    corr = valid[stats_list].corr()
    fig = px.imshow(
        corr, text_auto='.2f',
        color_continuous_scale='RdYlGn',
        zmin=-1, zmax=1,
        template='plotly_dark'
    )
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        height=450
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("#### Top 10 Per Stat")
    stat_choice = st.selectbox("Choose stat", stats_list)
    top10 = valid.nlargest(10, stat_choice)[['name', 'publisher', stat_choice]]
    colors = [MARVEL_RED if 'Marvel' in p else DC_BLUE for p in top10['publisher']]
    fig = go.Figure(go.Bar(
        x=top10[stat_choice], y=top10['name'],
        orientation='h',
        marker_color=colors
    ))
    fig.update_layout(
        template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)

# ════════════════════════════════
# 🏆 POWER RANKINGS
# ════════════════════════════════
elif section == "▲  Power Rankings":
    st.markdown("# ▲ POWER RANKINGS")
    st.markdown("*Composite score = average of all 6 stats*")
    st.markdown("---")

    top20 = valid.nlargest(20, 'power_score')[['name', 'publisher', 'power_score'] + stats_list]
    colors = [MARVEL_RED if 'Marvel' in p else DC_BLUE for p in top20['publisher']]

    fig = go.Figure(go.Bar(
        x=top20['power_score'], y=top20['name'],
        orientation='h', marker_color=colors,
        text=top20['power_score'], textposition='outside'
    ))
    fig.update_layout(
        template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis_range=[75, 105],
        height=600,
        title="Top 20 Most Powerful Heroes — Composite Score"
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("#### Search any hero")
    hero_name = st.text_input("Type hero name")
    if hero_name:
        result = valid[valid['name'].str.contains(hero_name, case=False)]
        if not result.empty:
            hero = result.iloc[0]
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"### {hero['name']}")
                st.markdown(f"**Publisher:** {hero['publisher']}")
                st.markdown(f"**Alignment:** {hero['alignment']}")
                st.markdown(f"**Power Score:** {hero['power_score']}")
            with col2:
                fig = go.Figure(go.Scatterpolar(
                    r=[hero[s] for s in stats_list] + [hero[stats_list[0]]],
                    theta=stats_list + [stats_list[0]],
                    fill='toself',
                    line_color=MARVEL_RED if 'Marvel' in hero['publisher'] else DC_BLUE,
                    fillcolor=f"{'rgba(196,30,58,0.3)' if 'Marvel' in hero['publisher'] else 'rgba(0,87,184,0.3)'}"
                ))
                fig.update_layout(
                    polar=dict(radialaxis=dict(range=[0, 110])),
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    height=300
                )
                st.plotly_chart(fig, use_container_width=True)
        else:
            st.warning("Hero not found")

# ════════════════════════════════
# 🧬 RACE ANALYSIS
# ════════════════════════════════
elif section == "◉  Race Analysis":
    st.markdown("# ◉ RACE ANALYSIS")
    st.markdown("---")

    top_races = valid['race'].value_counts().head(8).index.tolist()
    race_df = valid[valid['race'].isin(top_races)].copy()
    race_df['power_score'] = race_df[stats_list].mean(axis=1)
    race_power = race_df.groupby('race')['power_score'].mean().sort_values(ascending=False).round(1)

    fig = px.bar(
        x=race_power.index, y=race_power.values,
        color=race_power.values,
        color_continuous_scale='RdYlGn',
        template='plotly_dark',
        title="Average Power Score by Race"
    )
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        coloraxis_showscale=False,
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("#### Stat Heatmap by Race")
    race_avg = race_df.groupby('race')[stats_list].mean().round(1)
    fig = px.imshow(
        race_avg, text_auto='.1f',
        color_continuous_scale='YlOrRd',
        template='plotly_dark',
        title="Average Stats by Race"
    )
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)

# ════════════════════════════════
# 🃏 DECK INTELLIGENCE
# ════════════════════════════════
elif section == "◇  Deck Intelligence":
    st.markdown("# ◇ DECK INTELLIGENCE")
    st.markdown("*K-Means clustering validates deck quality. Dynamic sampling ensures every game is unique — 270 Marvel × 158 DC possible combinations.*")
    st.markdown("---")

    deck = load_deck()
    deck_rows = []
    for hero in deck:
        stats = hero["powerstats"]
        try:
            row = {
                "name": hero["name"],
                "publisher": hero["biography"]["publisher"],
                "alignment": hero["biography"]["alignment"],
                "intelligence": int(stats["intelligence"]),
                "strength": int(stats["strength"]),
                "speed": int(stats["speed"]),
                "durability": int(stats["durability"]),
                "power": int(stats["power"]),
                "combat": int(stats["combat"]),
            }
            row["power_score"] = round(sum(row[s] for s in stats_list) / 6, 1)
            row["balance_score"] = round(pd.Series([row[s] for s in stats_list]).std(), 1)
            deck_rows.append(row)
        except:
            pass

    deck_df = pd.DataFrame(deck_rows)

        col1, col2, col3, col4, col5 = st.columns(5)
        col1.metric("Cards/Game", "52")
        col2.metric("Marvel Pool", "270")
        col3.metric("DC Pool", "158")
        col4.metric("Other Pool", str(len(valid[~valid['publisher'].isin(['Marvel Comics', 'DC Comics'])])))
        col5.metric("Mix", "20+20+12")

    st.markdown("#### K-Means Deck vs Random 52")
    random_52 = valid.sample(52, random_state=99)
    deck_avg = deck_df[stats_list].mean().round(1)
    random_avg = random_52[stats_list].mean().round(1)

    fig = go.Figure()
    fig.add_trace(go.Bar(name='K-Means Deck', x=stats_list, y=deck_avg, marker_color='#9B59B6'))
    fig.add_trace(go.Bar(name='Random 52', x=stats_list, y=random_avg, marker_color='#95A5A6'))
    fig.update_layout(
        barmode='group', template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        height=350, title="Stat Quality: K-Means vs Random"
    )
    st.plotly_chart(fig, use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### Most Balanced Hero")
        balanced = deck_df.nsmallest(1, 'balance_score').iloc[0]
        fig = go.Figure(go.Scatterpolar(
            r=[balanced[s] for s in stats_list] + [balanced[stats_list[0]]],
            theta=stats_list + [stats_list[0]],
            fill='toself', line_color='#2ECC71',
            fillcolor='rgba(46,204,113,0.3)'
        ))
        fig.update_layout(
            polar=dict(radialaxis=dict(range=[0, 110])),
            template='plotly_dark',
            paper_bgcolor='rgba(0,0,0,0)',
            title=f"Most Balanced: {balanced['name']}",
            height=350
        )
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown("#### Most Specialized Hero")
        specialized = deck_df.nlargest(1, 'balance_score').iloc[0]
        fig = go.Figure(go.Scatterpolar(
            r=[specialized[s] for s in stats_list] + [specialized[stats_list[0]]],
            theta=stats_list + [stats_list[0]],
            fill='toself', line_color=MARVEL_RED,
            fillcolor='rgba(196,30,58,0.3)'
        ))
        fig.update_layout(
            polar=dict(radialaxis=dict(range=[0, 110])),
            template='plotly_dark',
            paper_bgcolor='rgba(0,0,0,0)',
            title=f"Most Specialized: {specialized['name']}",
            height=350
        )
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("#### Best Card Per Stat")
    cols = st.columns(6)
    for col, stat in zip(cols, stats_list):
        best = deck_df.loc[deck_df[stat].idxmax()]
        col.metric(stat.capitalize(), f"{best[stat]}", best['name'])

# ════════════════════════════════
# 🎮 GAME STATS
# ════════════════════════════════
elif section == "▶  Game Stats":
    st.markdown("# ▶ LIVE GAME STATISTICS")
    st.markdown("*Updated after every game played*")
    st.markdown("---")

    stats = load_game_stats()
    history = load_game_history()

    if not stats or "message" in stats:
        st.info("No games played yet! Play some games first then come back.")
    else:
        col1, col2, col3, col4, col5 = st.columns(5)
        col1.metric("Total Games", stats['total_games'])
        col2.metric("Player Wins", stats['player_wins'])
        col3.metric("CPU Wins", stats['cpu_wins'])
        col4.metric("Player Win Rate", f"{stats['player_win_rate']}%")
        col5.metric("Avg Rounds", stats['avg_rounds_per_game'])

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### Win Rate — Player vs CPU")
            fig = px.pie(
                values=[stats['player_wins'], stats['cpu_wins']],
                names=['Player', 'CPU'],
                color_discrete_map={'Player': '#2ECC71', 'CPU': MARVEL_RED},
                template='plotly_dark',
                hole=0.4
            )
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                height=300
            )
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            st.markdown("#### Most Used Stats Across All Games")
            if stats.get('stats_used'):
                stat_df = pd.DataFrame(
                    list(stats['stats_used'].items()),
                    columns=['Stat', 'Count']
                ).sort_values('Count', ascending=True)
                fig = px.bar(
                    stat_df, x='Count', y='Stat',
                    orientation='h',
                    color='Count',
                    color_continuous_scale='RdYlGn',
                    template='plotly_dark'
                )
                fig.update_layout(
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    coloraxis_showscale=False,
                    height=300
                )
                st.plotly_chart(fig, use_container_width=True)

        if history:
            st.markdown("#### Game History")
            history_df = pd.DataFrame(history)[['id', 'winner', 'total_rounds', 'player_cards_won', 'cpu_cards_won', 'winning_stat', 'created_at']]
            history_df['winner'] = history_df['winner'].str.upper()
            st.dataframe(
                history_df,
                use_container_width=True,
                hide_index=True
            )

            st.markdown("#### Rounds Per Game Over Time")
            fig = px.line(
                history_df.sort_values('created_at'),
                x='created_at', y='total_rounds',
                markers=True,
                color_discrete_sequence=[GOLD],
                template='plotly_dark',
                title="Game Length Trend"
            )
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                height=300
            )
            st.plotly_chart(fig, use_container_width=True)